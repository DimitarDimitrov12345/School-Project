<?php
/**
 * Trigger download-fixtures.js to update the JSON file
 */

$script_path = __DIR__ . '/download-fixtures.js';

// Run the Node.js script in background
shell_exec('node ' . escapeshellarg($script_path) . ' > /dev/null 2>&1 &');

// Return immediately without waiting
header('Content-Type: application/json');
echo json_encode(['status' => 'ok']);

?>
