/**
 * BiteBase Intelligence Connector Type Selector
 * Component for selecting data source types in the connector wizard
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Database, 
  Globe, 
  FileText, 
  Cloud,
  Check
} from 'lucide-react'
import type { ConnectorTemplate } from '../types/connectorTypes'

interface ConnectorTypeSelectorProps {
  templates: ConnectorTemplate[]
  selectedTemplate: ConnectorTemplate | null
  onSelect: (template: ConnectorTemplate) => void
  className?: string
}

const CATEGORY_ICONS = {
  database: Database,
  api: Globe,
  file: FileText,
  cloud: Cloud
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export function ConnectorTypeSelector({
  templates,
  selectedTemplate,
  onSelect,
  className
}: ConnectorTypeSelectorProps) {
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, ConnectorTemplate[]>)

  const categories = Object.keys(groupedTemplates).sort()

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Data Source</h3>
        <p className="text-muted-foreground">
          Select the type of data source you want to connect to
        </p>
      </div>

      {categories.map(category => {
        const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Database
        const categoryTemplates = groupedTemplates[category]

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center space-x-2">
              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
              <h4 className="font-medium capitalize">{category} Sources</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map(template => {
                const isSelected = selectedTemplate?.type === template.type
                const TemplateIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || Database

                return (
                  <Card
                    key={template.type}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary bg-primary/5'
                    )}
                    onClick={() => onSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}>
                            <TemplateIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-primary rounded-full">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            DIFFICULTY_COLORS[template.difficulty]
                          )}
                        >
                          {template.difficulty}
                        </Badge>
                        
                        <div className="text-xs text-muted-foreground">
                          {template.requiredFields.length} required fields
                        </div>
                      </div>

                      {template.examples && template.examples.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Example: {template.examples[0].name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected: {selectedTemplate.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {selectedTemplate.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Required fields:</span>
              <ul className="mt-1 space-y-1">
                {selectedTemplate.requiredFields.map(field => (
                  <li key={field} className="text-muted-foreground">
                    • {field.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
            
            {selectedTemplate.optionalFields.length > 0 && (
              <div>
                <span className="font-medium">Optional fields:</span>
                <ul className="mt-1 space-y-1">
                  {selectedTemplate.optionalFields.map(field => (
                    <li key={field} className="text-muted-foreground">
                      • {field.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {selectedTemplate.documentation && (
            <div className="mt-3 pt-3 border-t">
              <a 
                href={selectedTemplate.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View documentation →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ConnectorTypeSelector