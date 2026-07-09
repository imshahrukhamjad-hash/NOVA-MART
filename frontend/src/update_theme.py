#!/usr/bin/env python3
"""
Batch update script to add theme support to all components and pages
This script identifies hardcoded dark theme classes and replaces them with theme-aware versions
"""

import os
import re

def add_theme_import(content):
    """Add useTheme import if not already present"""
    if "useTheme" in content:
        return content
    
    # Check if it's a functional component
    if "export default function" in content or "export const" in content:
        # Add import after other imports
        lines = content.split('\n')
        import_idx = -1
        
        for i, line in enumerate(lines):
            if line.startswith('import ') and i < len(lines) - 1:
                import_idx = i
        
        if import_idx != -1:
            insert_line = import_idx + 1
            if 'from "react-icons' not in '\n'.join(lines[max(0, import_idx-3):import_idx+1]):
                insert_line = import_idx + 1
            
            lines.insert(insert_line, 'import { useTheme } from "../context/ThemeContext";')
            return '\n'.join(lines)
    
    return content

def add_theme_hook_usage(content):
    """Add theme hook to component"""
    if "const { theme }" in content:
        return content
    
    # Find the start of function body
    pattern = r'(export default function \w+\([^)]*\)\s*\{)'
    match = re.search(pattern, content)
    
    if match:
        insert_pos = match.end()
        # Check if there's already a useState or useEffect
        before_text = content[:insert_pos]
        after_text = content[insert_pos:]
        
        # Only add if no theme hook exists
        if 'const { theme }' not in content:
            content = before_text + '\n  const { theme } = useTheme();' + after_text
    
    return content

# For now, this is a placeholder for manual updates
# Each file is unique and requires careful handling
print("Theme support batch update - manual application required")
print("Use the following pattern for each file:")
print("1. Add: import { useTheme } from '../context/ThemeContext';")
print("2. Add: const { theme } = useTheme(); at start of component")
print("3. Replace hardcoded colors with theme-aware conditionals")
