import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const logFilePath = path.join(process.cwd(), 'public', 'output', 'process.log');
    
    if (!fs.existsSync(logFilePath)) {
      return NextResponse.json({ logs: [], error: 'Log file not found' });
    }

    const logs = fs.readFileSync(logFilePath, 'utf-8');
    const logLines = logs.split('\n').filter(line => line.trim() !== '');
    
    return NextResponse.json({ logs: logLines });
  } catch (error) {
    return NextResponse.json(
      { logs: [], error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

