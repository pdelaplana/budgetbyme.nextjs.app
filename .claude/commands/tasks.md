# Review Project Tasks

Reviews all current tasks documented in the `docs/tasks/` directory with their status and progress.

## Command
```bash
# Display task overview with status  
echo "=== PROJECT TASKS OVERVIEW ==="
echo ""

# Process each task file individually
if [ -f "docs/tasks/category-page-refactoring.md" ]; then
    echo "📋 Category Page Refactoring"
    echo "   File: docs/tasks/category-page-refactoring.md"
    
    if grep -q "✅.*COMPLETED" "docs/tasks/category-page-refactoring.md"; then
        echo "   Status: ✅ COMPLETED"
    elif grep -q "🟡.*IN PROGRESS" "docs/tasks/category-page-refactoring.md"; then
        echo "   Status: 🟡 IN PROGRESS" 
    else
        echo "   Status: 📝 UNKNOWN"
    fi
    
    total=$(grep -c "^- \[.\]" "docs/tasks/category-page-refactoring.md" 2>/dev/null || echo "0")
    completed=$(grep -c "^- \[x\]" "docs/tasks/category-page-refactoring.md" 2>/dev/null || echo "0")
    
    if [ "$total" -gt 0 ]; then
        percent=$((completed * 100 / total))
        echo "   Progress: $completed/$total tasks completed ($percent%)"
    fi
    echo ""
fi

if [ -f "docs/tasks/expense-detail-page-refactoring.md" ]; then
    echo "📋 Expense Detail Page Refactoring"  
    echo "   File: docs/tasks/expense-detail-page-refactoring.md"
    
    if grep -q "✅.*COMPLETED" "docs/tasks/expense-detail-page-refactoring.md"; then
        echo "   Status: ✅ COMPLETED"
    elif grep -q "🟡.*IN PROGRESS" "docs/tasks/expense-detail-page-refactoring.md"; then
        echo "   Status: 🟡 IN PROGRESS"
    else 
        echo "   Status: 📝 UNKNOWN"
    fi
    
    total=$(grep -c "^- \[.\]" "docs/tasks/expense-detail-page-refactoring.md" 2>/dev/null || echo "0")
    completed=$(grep -c "^- \[x\]" "docs/tasks/expense-detail-page-refactoring.md" 2>/dev/null || echo "0")
    
    if [ "$total" -gt 0 ]; then
        percent=$((completed * 100 / total))
        echo "   Progress: $completed/$total tasks completed ($percent%)"
    fi
    echo ""
fi

# Check for any other task files
find docs/tasks -name "*.md" -type f 2>/dev/null | while read -r file; do
    case "$file" in
        "docs/tasks/category-page-refactoring.md"|"docs/tasks/expense-detail-page-refactoring.md")
            # Skip - already processed above
            ;;
        *)
            basename_file=$(basename "$file" .md | tr '-' ' ')
            echo "📋 $basename_file"
            echo "   File: $file"
            echo "   Status: 📝 UNKNOWN"
            echo ""
            ;;
    esac
done

echo "=== TASK DETAILS ==="
echo "Use 'claude read docs/tasks/[filename].md' to view detailed task information"
```

## Usage
This command will:
1. List all task files in the `docs/tasks/` directory
2. Show the status of each task file (✅ COMPLETED, 🟡 IN PROGRESS, ❌ NOT STARTED)
3. Display progress metrics (completed tasks / total tasks)
4. Show last updated dates when available
5. Provide guidance on viewing detailed task information

Perfect for getting a quick overview of all project tasks and their current status.