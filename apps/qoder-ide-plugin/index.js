/**
 * Plannotator Plugin for Qoder IDE
 *
 * Provides interactive plan review, code review, and markdown annotation
 * capabilities for Qoder IDE.
 */

const path = require('path');
const { spawn } = require('child_process');

/**
 * Qoder IDE Plugin Entry Point
 */
exports.activate = function(context) {
  console.log('Plannotator plugin activated');

  // Register commands
  context.subscriptions.push(
    registerCommand('plannotator.review', () => {
      runPlannotatorCommand('review');
    }),

    registerCommand('plannotator.annotate', (filePath) => {
      runPlannotatorCommand('annotate', filePath);
    }),

    registerCommand('plannotator.last', () => {
      runPlannotatorCommand('annotate-last');
    }),

    registerCommand('plannotator.plan', (planContent) => {
      runPlannotatorCommand('plan', planContent);
    })
  );
};

/**
 * Register a command with Qoder IDE
 */
function registerCommand(commandId, handler) {
  // This is a placeholder for Qoder IDE's command registration API
  // The actual implementation will depend on Qoder IDE's extension API
  console.log(`Registered command: ${commandId}`);
  return {
    dispose: () => {
      console.log(`Disposed command: ${commandId}`);
    }
  };
}

/**
 * Run Plannotator command
 */
function runPlannotatorCommand(command, ...args) {
  const plannotatorPath = path.join(__dirname, '..', 'qoder-plugin', 'dist', 'index.js');
  const bunPath = getBunPath();

  if (!bunPath) {
    console.error('Bun runtime not found');
    return;
  }

  const cmdArgs = [plannotatorPath];
  
  switch (command) {
    case 'review':
      cmdArgs.push('review');
      break;
    case 'annotate':
      cmdArgs.push('annotate', args[0]);
      break;
    case 'annotate-last':
      cmdArgs.push('last');
      break;
    case 'plan':
      // For plan review, we need to use the MCP server
      // This is a placeholder
      console.log('Plan review command');
      return;
    default:
      console.error(`Unknown command: ${command}`);
      return;
  }

  const child = spawn(bunPath, cmdArgs, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error('Error running Plannotator:', err);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Plannotator command exited with code ${code}`);
    }
  });
}

/**
 * Get Bun executable path
 */
function getBunPath() {
  const paths = [
    process.env.BUN_PATH,
    '/usr/local/bin/bun',
    '/opt/homebrew/bin/bun',
    path.join(process.env.HOME, '.bun', 'bin', 'bun'),
    path.join(process.env.USERPROFILE, '.bun', 'bin', 'bun.exe')
  ];

  for (const bunPath of paths) {
    if (bunPath && require('fs').existsSync(bunPath)) {
      return bunPath;
    }
  }

  return null;
}

/**
 * Plugin deactivation
 */
exports.deactivate = function() {
  console.log('Plannotator plugin deactivated');
};
