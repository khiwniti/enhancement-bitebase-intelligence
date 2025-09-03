"""
BiteBase Intelligence Export Service
Dashboard export functionality for PDF, PNG, and other formats
"""

import asyncio
import json
import os
import tempfile
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, BinaryIO
import logging
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.dashboard import Dashboard, DashboardExport
from app.schemas.dashboard import ExportOptions
from app.core.config import settings

logger = logging.getLogger(__name__)


class ExportService:
    """Service for exporting dashboards to various formats"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.export_dir = Path(tempfile.gettempdir()) / "bitebase_exports"
        self.export_dir.mkdir(exist_ok=True)
        
        # Export format configurations
        self.format_configs = {
            'json': {
                'mime_type': 'application/json',
                'extension': '.json',
                'supports_quality': False,
                'supports_dimensions': False,
                'max_file_size_mb': 50
            },
            'pdf': {
                'mime_type': 'application/pdf',
                'extension': '.pdf',
                'supports_quality': True,
                'supports_dimensions': True,
                'max_file_size_mb': 100
            },
            'png': {
                'mime_type': 'image/png',
                'extension': '.png',
                'supports_quality': True,
                'supports_dimensions': True,
                'max_file_size_mb': 20
            },
            'svg': {
                'mime_type': 'image/svg+xml',
                'extension': '.svg',
                'supports_quality': False,
                'supports_dimensions': True,
                'max_file_size_mb': 10
            }
        }
    
    async def create_export(self, dashboard_id: uuid.UUID, options: ExportOptions, 
                          user_id: uuid.UUID) -> Optional[DashboardExport]:
        """Create a new dashboard export job"""
        try:
            # Verify dashboard access
            dashboard_query = select(Dashboard).where(Dashboard.id == str(dashboard_id))
            dashboard_result = await self.db.execute(dashboard_query)
            dashboard = dashboard_result.scalar_one_or_none()
            
            if not dashboard:
                return None
            
            # Check if user has access to dashboard
            if dashboard.user_id != str(user_id) and not dashboard.is_public:
                return None
            
            # Generate export filename
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c for c in dashboard.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            filename = f"{safe_name}_{timestamp}{self.format_configs[options.format]['extension']}"
            
            # Create export record
            export = DashboardExport(
                dashboard_id=str(dashboard_id),
                export_format=options.format,
                export_options=options.model_dump(),
                file_name=filename,
                status='pending',
                requested_by=str(user_id),
                expires_at=datetime.utcnow() + timedelta(hours=24)  # 24 hour expiration
            )
            
            self.db.add(export)
            await self.db.commit()
            await self.db.refresh(export)
            
            # Start background export process
            asyncio.create_task(self._process_export(export, dashboard))
            
            logger.info(f"Created export job {export.id} for dashboard {dashboard_id}")
            return export
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating export: {str(e)}")
            raise
    
    async def get_export_status(self, export_id: uuid.UUID, user_id: uuid.UUID) -> Optional[DashboardExport]:
        """Get export status and download URL if ready"""
        try:
            query = select(DashboardExport).where(
                DashboardExport.id == str(export_id),
                DashboardExport.requested_by == str(user_id)
            )
            result = await self.db.execute(query)
            export = result.scalar_one_or_none()
            
            if export and export.status == 'completed' and export.file_path:
                # Generate temporary download URL
                export.download_url = f"/api/v1/dashboards/exports/{export.id}/download"
            
            return export
            
        except Exception as e:
            logger.error(f"Error getting export status: {str(e)}")
            return None
    
    async def get_export_file(self, export_id: uuid.UUID, user_id: uuid.UUID) -> Optional[tuple[str, bytes, str]]:
        """Get export file content for download"""
        try:
            export = await self.get_export_status(export_id, user_id)
            
            if not export or export.status != 'completed' or not export.file_path:
                return None
            
            # Check if file exists and hasn't expired
            file_path = Path(export.file_path)
            if not file_path.exists() or datetime.utcnow() > export.expires_at:
                return None
            
            # Read file content
            with open(file_path, 'rb') as f:
                content = f.read()
            
            mime_type = self.format_configs[export.export_format]['mime_type']
            
            return export.file_name, content, mime_type
            
        except Exception as e:
            logger.error(f"Error getting export file: {str(e)}")
            return None
    
    async def _process_export(self, export: DashboardExport, dashboard: Dashboard):
        """Process export in background"""
        try:
            # Update status to processing
            export.status = 'processing'
            export.progress = 0.1
            await self.db.commit()
            
            # Get export options
            options = ExportOptions(**export.export_options)
            
            # Generate file path
            file_path = self.export_dir / f"{export.id}{self.format_configs[export.export_format]['extension']}"
            
            # Process based on format
            if export.export_format == 'json':
                await self._export_json(dashboard, file_path, options)
            elif export.export_format == 'pdf':
                await self._export_pdf(dashboard, file_path, options)
            elif export.export_format == 'png':
                await self._export_png(dashboard, file_path, options)
            elif export.export_format == 'svg':
                await self._export_svg(dashboard, file_path, options)
            else:
                raise ValueError(f"Unsupported export format: {export.export_format}")
            
            # Update export record
            export.status = 'completed'
            export.progress = 1.0
            export.file_path = str(file_path)
            export.file_size = file_path.stat().st_size
            export.completed_at = datetime.utcnow()
            
            await self.db.commit()
            
            logger.info(f"Completed export {export.id}")
            
        except Exception as e:
            # Update export record with error
            export.status = 'failed'
            export.error_message = str(e)
            await self.db.commit()
            
            logger.error(f"Export {export.id} failed: {str(e)}")
    
    async def _export_json(self, dashboard: Dashboard, file_path: Path, options: ExportOptions):
        """Export dashboard as JSON"""
        try:
            # Build dashboard data
            dashboard_data = {
                'id': dashboard.id,
                'name': dashboard.name,
                'description': dashboard.description,
                'author': dashboard.author,
                'version': dashboard.version,
                'created_at': dashboard.created_at.isoformat(),
                'updated_at': dashboard.updated_at.isoformat(),
                'exported_at': datetime.utcnow().isoformat(),
                'export_options': options.model_dump()
            }
            
            # Add configuration if requested
            if options.include_config:
                dashboard_data.update({
                    'layout_config': dashboard.layout_config,
                    'theme_config': dashboard.theme_config,
                    'settings_config': dashboard.settings_config,
                    'tags': dashboard.tags
                })
            
            # Add widgets
            widgets_data = []
            for widget in dashboard.widgets:
                if widget.is_active:
                    widget_data = {
                        'id': widget.id,
                        'type': widget.type,
                        'chart_type': widget.chart_type,
                        'title': widget.title,
                        'description': widget.description,
                        'position_config': widget.position_config,
                        'widget_config': widget.widget_config,
                        'chart_props': widget.chart_props,
                        'style_config': widget.style_config,
                        'created_at': widget.created_at.isoformat(),
                        'updated_at': widget.updated_at.isoformat()
                    }
                    
                    # Add data if requested
                    if options.include_data and widget.data_config:
                        widget_data['data_config'] = widget.data_config
                        widget_data['data_source'] = widget.data_source
                    
                    widgets_data.append(widget_data)
            
            dashboard_data['widgets'] = widgets_data
            
            # Write to file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            logger.error(f"Error exporting JSON: {str(e)}")
            raise
    
    async def _export_pdf(self, dashboard: Dashboard, file_path: Path, options: ExportOptions):
        """Export dashboard as PDF"""
        try:
            # This is a placeholder implementation
            # In a real system, you would use libraries like:
            # - weasyprint for HTML to PDF conversion
            # - reportlab for programmatic PDF generation
            # - puppeteer/playwright for browser-based PDF generation
            
            # For now, create a simple text-based PDF placeholder
            pdf_content = f"""
Dashboard Export: {dashboard.name}
Generated: {datetime.utcnow().isoformat()}
Description: {dashboard.description or 'No description'}

Widgets: {len([w for w in dashboard.widgets if w.is_active])}
Version: {dashboard.version}
Author: {dashboard.author}

This is a placeholder PDF export.
In a production system, this would contain the actual dashboard visualization.
"""
            
            # Write placeholder content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(pdf_content)
            
            logger.warning("PDF export is using placeholder implementation")
            
        except Exception as e:
            logger.error(f"Error exporting PDF: {str(e)}")
            raise
    
    async def _export_png(self, dashboard: Dashboard, file_path: Path, options: ExportOptions):
        """Export dashboard as PNG"""
        try:
            # This is a placeholder implementation
            # In a real system, you would use:
            # - puppeteer/playwright to render the dashboard in a browser
            # - PIL/Pillow for image manipulation
            # - matplotlib/plotly for chart rendering
            
            # Create a placeholder text file for now
            png_info = f"""
PNG Export Placeholder for Dashboard: {dashboard.name}
Dimensions: {options.width or 1920}x{options.height or 1080}
Quality: {options.quality or 90}%
Generated: {datetime.utcnow().isoformat()}

This would be a PNG image of the dashboard in a production system.
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(png_info)
            
            logger.warning("PNG export is using placeholder implementation")
            
        except Exception as e:
            logger.error(f"Error exporting PNG: {str(e)}")
            raise
    
    async def _export_svg(self, dashboard: Dashboard, file_path: Path, options: ExportOptions):
        """Export dashboard as SVG"""
        try:
            # This is a placeholder implementation
            # In a real system, you would generate actual SVG content
            
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{options.width or 1920}" height="{options.height or 1080}" 
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="{options.background_color or '#ffffff'}"/>
  <text x="50" y="50" font-family="Arial" font-size="24" fill="#333333">
    Dashboard: {dashboard.name}
  </text>
  <text x="50" y="80" font-family="Arial" font-size="14" fill="#666666">
    Exported: {datetime.utcnow().isoformat()}
  </text>
  <text x="50" y="110" font-family="Arial" font-size="14" fill="#666666">
    This is a placeholder SVG export.
  </text>
</svg>'''
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            logger.warning("SVG export is using placeholder implementation")
            
        except Exception as e:
            logger.error(f"Error exporting SVG: {str(e)}")
            raise
    
    async def cleanup_expired_exports(self):
        """Clean up expired export files"""
        try:
            # Find expired exports
            expired_query = select(DashboardExport).where(
                DashboardExport.expires_at < datetime.utcnow(),
                DashboardExport.status == 'completed'
            )
            result = await self.db.execute(expired_query)
            expired_exports = result.scalars().all()
            
            cleaned_count = 0
            for export in expired_exports:
                try:
                    # Delete file if it exists
                    if export.file_path and Path(export.file_path).exists():
                        Path(export.file_path).unlink()
                    
                    # Delete export record
                    await self.db.delete(export)
                    cleaned_count += 1
                    
                except Exception as e:
                    logger.error(f"Error cleaning up export {export.id}: {str(e)}")
            
            if cleaned_count > 0:
                await self.db.commit()
                logger.info(f"Cleaned up {cleaned_count} expired exports")
            
        except Exception as e:
            logger.error(f"Error during export cleanup: {str(e)}")
    
    def get_supported_formats(self) -> Dict[str, Dict[str, Any]]:
        """Get list of supported export formats"""
        return {
            format_name: {
                'name': format_name.upper(),
                'mime_type': config['mime_type'],
                'extension': config['extension'],
                'supports_quality': config['supports_quality'],
                'supports_dimensions': config['supports_dimensions'],
                'max_file_size_mb': config['max_file_size_mb']
            }
            for format_name, config in self.format_configs.items()
        }