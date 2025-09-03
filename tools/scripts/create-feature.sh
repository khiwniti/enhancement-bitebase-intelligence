#!/bin/bash

# BiteBase Intelligence Feature Generator
# Creates a new feature from template with proper naming conventions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEMPLATE_DIR="tools/templates/feature-template"
FEATURES_DIR="frontend/src/features"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Functions
print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                BiteBase Intelligence                          ║${NC}"
    echo -e "${BLUE}║                  Feature Generator                           ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

validate_feature_name() {
    local name="$1"
    
    # Check if name is provided
    if [[ -z "$name" ]]; then
        print_error "Feature name is required"
        echo "Usage: $0 <feature-name>"
        echo "Example: $0 user-management"
        exit 1
    fi
    
    # Check if name contains only valid characters
    if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        print_error "Feature name must be in kebab-case (lowercase letters, numbers, hyphens only)"
        echo "Valid examples: user-management, order-tracking, payment-processing"
        exit 1
    fi
    
    # Check if feature already exists
    if [[ -d "$FEATURES_DIR/$name" ]]; then
        print_error "Feature '$name' already exists at $FEATURES_DIR/$name"
        exit 1
    fi
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if we're in the project root
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        print_error "This script must be run from the project root directory"
        exit 1
    fi
    
    # Check if template directory exists
    if [[ ! -d "$PROJECT_ROOT/$TEMPLATE_DIR" ]]; then
        print_error "Template directory not found: $TEMPLATE_DIR"
        exit 1
    fi
    
    # Check if features directory exists
    if [[ ! -d "$PROJECT_ROOT/$FEATURES_DIR" ]]; then
        print_error "Features directory not found: $FEATURES_DIR"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

convert_naming() {
    local kebab_name="$1"
    
    # Convert kebab-case to camelCase
    CAMEL_NAME=$(echo "$kebab_name" | sed -E 's/-([a-z])/\U\1/g')
    
    # Convert kebab-case to PascalCase
    PASCAL_NAME=$(echo "$CAMEL_NAME" | sed 's/^./\U&/')
    
    print_info "Naming conventions:"
    echo "  - Kebab case: $kebab_name"
    echo "  - Camel case: $CAMEL_NAME"
    echo "  - Pascal case: $PASCAL_NAME"
}

copy_template() {
    local feature_name="$1"
    local target_dir="$PROJECT_ROOT/$FEATURES_DIR/$feature_name"
    
    print_info "Creating feature directory structure..."
    
    # Create target directory
    mkdir -p "$target_dir"
    
    # Copy template files
    cp -r "$PROJECT_ROOT/$TEMPLATE_DIR"/* "$target_dir/"
    
    print_success "Template files copied to $target_dir"
}

replace_placeholders() {
    local feature_name="$1"
    local target_dir="$PROJECT_ROOT/$FEATURES_DIR/$feature_name"
    
    print_info "Replacing template placeholders..."
    
    # Find all files in the target directory
    find "$target_dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) | while read -r file; do
        # Replace placeholders in file content
        sed -i.bak \
            -e "s/\[FeatureName\]/$PASCAL_NAME/g" \
            -e "s/\[featureName\]/$CAMEL_NAME/g" \
            -e "s/\[feature-name\]/$feature_name/g" \
            "$file"
        
        # Remove backup file
        rm -f "$file.bak"
        
        # Rename files that contain placeholders
        if [[ "$file" == *"[FeatureName]"* ]]; then
            new_file=$(echo "$file" | sed "s/\[FeatureName\]/$PASCAL_NAME/g")
            mv "$file" "$new_file"
            print_info "Renamed: $(basename "$file") → $(basename "$new_file")"
        elif [[ "$file" == *"[featureName]"* ]]; then
            new_file=$(echo "$file" | sed "s/\[featureName\]/$CAMEL_NAME/g")
            mv "$file" "$new_file"
            print_info "Renamed: $(basename "$file") → $(basename "$new_file")"
        fi
    done
    
    print_success "Placeholders replaced successfully"
}

update_feature_exports() {
    local feature_name="$1"
    local features_index="$PROJECT_ROOT/$FEATURES_DIR/index.ts"
    
    print_info "Updating feature exports..."
    
    # Create features index file if it doesn't exist
    if [[ ! -f "$features_index" ]]; then
        cat > "$features_index" << 'EOF'
/**
 * Feature exports
 * 
 * This file exports all features for easy importing
 */

EOF
    fi
    
    # Add export for new feature
    echo "export * from './$feature_name'" >> "$features_index"
    
    print_success "Added feature export to $features_index"
}

generate_feature_docs() {
    local feature_name="$1"
    local target_dir="$PROJECT_ROOT/$FEATURES_DIR/$feature_name"
    
    print_info "Generating feature documentation..."
    
    # Update README with specific feature information
    local readme_file="$target_dir/README.md"
    if [[ -f "$readme_file" ]]; then
        # Add feature-specific content to README
        cat >> "$readme_file" << EOF

## Getting Started

1. **Development**: Start the development server with \`make dev\`
2. **Testing**: Run tests with \`yarn test\`
3. **Building**: Build the project with \`make build\`

## Feature Routes

- \`/$feature_name\` - Main feature page
- \`/$feature_name/[id]\` - Item detail page (if applicable)

## API Endpoints

- \`GET /api/$feature_name\` - Fetch feature data
- \`POST /api/$feature_name\` - Create new item
- \`PUT /api/$feature_name/[id]\` - Update item
- \`DELETE /api/$feature_name/[id]\` - Delete item

## Next Steps

1. Customize the data types in \`types/${CAMEL_NAME}.types.ts\`
2. Update the API service in \`services/${CAMEL_NAME}Api.ts\`
3. Modify components to match your feature requirements
4. Add your specific business logic
5. Write comprehensive tests
6. Update the configuration in \`config.ts\`

## Resources

- [Component Patterns](../../docs/COMPONENT_PATTERNS.md)
- [Testing Guide](../../docs/TESTING.md)
- [API Documentation](../../docs/API.md)
EOF
    fi
    
    print_success "Feature documentation generated"
}

run_post_generation_checks() {
    local feature_name="$1"
    local target_dir="$PROJECT_ROOT/$FEATURES_DIR/$feature_name"
    
    print_info "Running post-generation checks..."
    
    # Check if all expected files exist
    local expected_files=(
        "components/${PASCAL_NAME}Page.tsx"
        "components/${PASCAL_NAME}Header.tsx"
        "components/${PASCAL_NAME}Content.tsx"
        "components/index.ts"
        "hooks/use${PASCAL_NAME}Data.ts"
        "hooks/use${PASCAL_NAME}State.ts"
        "hooks/index.ts"
        "services/${CAMEL_NAME}Api.ts"
        "services/${CAMEL_NAME}Cache.ts"
        "services/index.ts"
        "types/${CAMEL_NAME}.types.ts"
        "types/index.ts"
        "utils/${CAMEL_NAME}Utils.ts"
        "utils/index.ts"
        "tests/${PASCAL_NAME}.test.tsx"
        "tests/${CAMEL_NAME}Api.test.ts"
        "tests/hooks.test.ts"
        "config.ts"
        "index.ts"
        "README.md"
    )
    
    local missing_files=()
    for file in "${expected_files[@]}"; do
        if [[ ! -f "$target_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_success "All expected files created successfully"
    else
        print_warning "Some files might be missing:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
    fi
    
    # Check for any remaining placeholders
    local remaining_placeholders=$(find "$target_dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) -exec grep -l "\[.*\]" {} \; 2>/dev/null || true)
    
    if [[ -z "$remaining_placeholders" ]]; then
        print_success "No remaining placeholders found"
    else
        print_warning "Found files with remaining placeholders:"
        echo "$remaining_placeholders" | while read -r file; do
            echo "  - $file"
        done
    fi
}

print_completion_message() {
    local feature_name="$1"
    local target_dir="$PROJECT_ROOT/$FEATURES_DIR/$feature_name"
    
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                   Feature Created Successfully!              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    print_success "Feature '$feature_name' has been created successfully!"
    echo
    print_info "Feature location: $target_dir"
    print_info "Feature components:"
    echo "  - ${PASCAL_NAME}Page: Main feature page component"
    echo "  - ${PASCAL_NAME}Header: Feature header with controls"
    echo "  - ${PASCAL_NAME}Content: Main content area"
    echo "  - use${PASCAL_NAME}Data: Data fetching hook"
    echo "  - use${PASCAL_NAME}State: State management hook"
    echo "  - ${PASCAL_NAME}Api: API service layer"
    echo
    print_info "Next steps:"
    echo "  1. Customize data types in types/${CAMEL_NAME}.types.ts"
    echo "  2. Update API endpoints in services/${CAMEL_NAME}Api.ts"
    echo "  3. Modify components to match your requirements"
    echo "  4. Run tests: yarn test $feature_name"
    echo "  5. Start development: make dev"
    echo
    print_info "Documentation: $target_dir/README.md"
    echo
}

# Main execution
main() {
    local feature_name="$1"
    
    print_header
    
    # Validate input
    validate_feature_name "$feature_name"
    
    # Check prerequisites
    check_prerequisites
    
    # Convert naming conventions
    convert_naming "$feature_name"
    
    # Create feature
    copy_template "$feature_name"
    replace_placeholders "$feature_name"
    update_feature_exports "$feature_name"
    generate_feature_docs "$feature_name"
    
    # Verify creation
    run_post_generation_checks "$feature_name"
    
    # Show completion message
    print_completion_message "$feature_name"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi