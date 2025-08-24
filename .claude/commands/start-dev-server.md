# Start Next.js in Background

Start the Next.js development server in the background with logging.

## Command
```bash
nohup npm run dev > nextjs.log 2>&1 &
echo "Next.js started in background. PID: $!"
echo "Logs are being written to nextjs.log"
echo "To stop: kill \$(pgrep -f 'npm run dev')"