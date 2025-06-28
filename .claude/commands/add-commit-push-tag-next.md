# Add, Commit, Push, and Tag Next Version

This command helps you commit changes and create the next date-based version tag.

## Current Tag Versioning Pattern

Using date-based versioning format: `v1.0.YYYYMMDD.HHMM`

Latest tag: `v1.0.20250628.1526`

## Command Steps

1. **Check Status and Prepare**
   ```bash
   git status
   git diff
   ```

2. **Add Changes**
   ```bash
   git add .
   # or specific files: git add path/to/file
   ```

3. **Commit with Emoji** (following project convention)
   ```bash
   git commit -m "Your commit message 😊"
   ```

4. **Push Changes**
   ```bash
   git push
   ```

5. **Create Next Date-Based Tag**
   
   Generate current timestamp:
   ```bash
   # Get current date and time in format YYYYMMDD.HHMM
   DATE_TAG=$(date +"%Y%m%d.%H%M")
   echo "Next tag will be: v1.0.$DATE_TAG"
   ```
   
   Create the tag:
   ```bash
   git tag -a "v1.0.$DATE_TAG" -m "Release $(date +'%Y-%m-%d %H:%M') - [brief description]"
   ```

6. **Push Tags**
   ```bash
   git push --tags
   ```

## Quick One-Liner for Next Tag

```bash
DATE_TAG=$(date +"%Y%m%d.%H%M") && git tag -a "v1.0.$DATE_TAG" -m "Release $(date +'%Y-%m-%d %H:%M')" && git push --tags
```

## Example Usage

If current time is 2025-06-28 15:30:
```bash
git tag -a v1.0.20250628.1530 -m "Release 2025-06-28 15:30 - Canvas drag improvements"
git push --tags
```

## Commit Message Format

Follow project convention:
- Include emoji 😊 at the end
- Keep messages descriptive but concise
- Focus on what was changed and why

Example:
```bash
git commit -m "Add entity relationship visualization to canvas 😊"
```