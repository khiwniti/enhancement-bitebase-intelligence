#!/bin/bash

# Translation script to create missing language files
cd /workspaces/coder/enhancement-bitebase-intelligence/frontend/public/locales

# Define language codes and their translations for language names
declare -A languages=(
  ["de"]="Deutsch"
  ["fr"]="Français"
  ["it"]="Italiano" 
  ["ja"]="日本語"
  ["ko"]="한국어"
  ["pt"]="Português"
  ["zh"]="中文"
)

# Create core files for each missing language
for lang in de fr it ja ko pt zh; do
  echo "Creating files for $lang..."
  
  # Skip if directory doesn't exist
  [ ! -d "$lang" ] && continue
  
  # Create common.json
  if [ ! -f "$lang/common.json" ]; then
    cat > "$lang/common.json" << EOF
{
  "navigation": {
    "dashboard": "Dashboard",
    "analytics": "Analytics",
    "restaurants": "Restaurants",
    "ai_assistant": "AI Assistant",
    "reports": "Reports",
    "settings": "Settings",
    "logout": "Logout",
    "features": "Features",
    "pricing": "Pricing",
    "about": "About",
    "contact": "Contact"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "create": "Create",
    "update": "Update",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import",
    "refresh": "Refresh",
    "loading": "Loading...",
    "submit": "Submit",
    "confirm": "Confirm",
    "close": "Close",
    "sign_in": "Sign in",
    "get_started": "Get started",
    "learnMore": "Learn More"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "pending": "Pending",
    "completed": "Completed",
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Information"
  },
  "time": {
    "today": "Today",
    "yesterday": "Yesterday",
    "this_week": "This Week",
    "last_week": "Last Week",
    "this_month": "This Month",
    "last_month": "Last Month",
    "this_year": "This Year"
  },
  "language": {
    "select": "Select Language",
    "auto_detect": "Auto-detect",
    "english": "English",
    "spanish": "Español",
    "french": "Français",
    "german": "Deutsch",
    "italian": "Italiano",
    "portuguese": "Português",
    "chinese": "中文",
    "japanese": "日本語",
    "korean": "한국어",
    "arabic": "العربية"
  }
}
EOF
  fi

  # Create navigation.json
  if [ ! -f "$lang/navigation.json" ]; then
    cat > "$lang/navigation.json" << EOF
{
  "main": {
    "dashboard": "Dashboard",
    "analytics": "Analytics", 
    "restaurants": "Restaurants",
    "ai_assistant": "AI Assistant",
    "reports": "Reports",
    "settings": "Settings",
    "logout": "Logout"
  },
  "public": {
    "features": "Features",
    "pricing": "Pricing", 
    "about": "About",
    "contact": "Contact",
    "home": "Home"
  },
  "analytics": {
    "4p_analytics": "4P Analytics",
    "analytics_center": "Analytics Center",
    "analytics_workbench": "Analytics Workbench"
  },
  "location": {
    "location_center": "Location Center", 
    "location_intelligence": "Location Intelligence"
  },
  "market": {
    "market_analysis": "Market Analysis",
    "market_research": "Market Research"
  },
  "ai": {
    "ai_center": "AI Center",
    "research_agent": "Research Agent",
    "growth_studio": "Growth Studio"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "forgot_password": "Forgot Password"
  }
}
EOF
  fi

  # Create auth.json
  if [ ! -f "$lang/auth.json" ]; then
    cat > "$lang/auth.json" << EOF
{
  "login": {
    "title": "Sign In",
    "email": "Email",
    "password": "Password",
    "remember_me": "Remember me",
    "forgot_password": "Forgot Password?",
    "sign_in": "Sign In",
    "no_account": "Don't have an account?",
    "create_account": "Create Account"
  },
  "register": {
    "title": "Create Account",
    "name": "Full Name",
    "email": "Email",
    "password": "Password",
    "confirm_password": "Confirm Password",
    "create_account": "Create Account",
    "have_account": "Already have an account?",
    "sign_in": "Sign In"
  },
  "forgot": {
    "title": "Reset Password",
    "email": "Email",
    "send_reset": "Send Reset Link",
    "back_to_login": "Back to Login"
  },
  "errors": {
    "invalid_credentials": "Invalid email or password",
    "email_required": "Email is required",
    "password_required": "Password is required",
    "name_required": "Name is required",
    "passwords_dont_match": "Passwords don't match"
  }
}
EOF
  fi

  # Create dashboard.json
  if [ ! -f "$lang/dashboard.json" ]; then
    cat > "$lang/dashboard.json" << EOF
{
  "title": "Dashboard",
  "welcome": "Welcome back",
  "overview": {
    "title": "Overview",
    "total_restaurants": "Total Restaurants",
    "active_campaigns": "Active Campaigns", 
    "monthly_revenue": "Monthly Revenue",
    "growth_rate": "Growth Rate"
  },
  "quick_actions": {
    "title": "Quick Actions",
    "add_restaurant": "Add Restaurant",
    "create_campaign": "Create Campaign",
    "view_analytics": "View Analytics",
    "generate_report": "Generate Report"
  },
  "recent_activity": {
    "title": "Recent Activity",
    "no_activity": "No recent activity"
  }
}
EOF
  fi

  echo "Created base files for $lang"
done

echo "Translation files creation completed!"