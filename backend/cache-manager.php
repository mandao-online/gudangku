<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Cache Manager - Hostinger</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #1d4ed8; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .result { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin-top: 10px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .loading { display: none; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧹 Laravel Cache Manager</h1>
        <p>Web-based cache clearing for Hostinger deployment</p>
    </div>

    <div class="card">
        <h2>Quick Actions</h2>
        <button class="btn" onclick="clearAllCache()">🗑️ Clear All Cache</button>
        <button class="btn" onclick="clearSpecificCache('config')">⚙️ Clear Config</button>
        <button class="btn" onclick="clearSpecificCache('routes')">🛣️ Clear Routes</button>
        <button class="btn" onclick="clearSpecificCache('views')">👁️ Clear Views</button>
        <button class="btn btn-danger" onclick="clearLogs()">📝 Clear Logs</button>
    </div>

    <div class="card">
        <h2>Cache Status</h2>
        <button class="btn" onclick="checkCacheStatus()">📊 Check Status</button>
        <div id="status-result"></div>
    </div>

    <div class="card">
        <h2>Results</h2>
        <div id="result" class="loading">Processing...</div>
    </div>

    <script>
        function showLoading() {
            document.getElementById('result').className = 'loading';
            document.getElementById('result').style.display = 'block';
            document.getElementById('result').innerHTML = 'Processing...';
        }

        function showResult(data, isError = false) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = isError ? 'result error' : 'result';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        function clearAllCache() {
            showLoading();
            fetch('clear-cache.php')
                .then(response => response.json())
                .then(data => showResult(data))
                .catch(error => showResult({error: error.message}, true));
        }

        function clearSpecificCache(type) {
            showLoading();
            fetch(`clear-cache.php?type=${type}`)
                .then(response => response.json())
                .then(data => showResult(data))
                .catch(error => showResult({error: error.message}, true));
        }

        function clearLogs() {
            if (confirm('Are you sure you want to clear all log files?')) {
                showLoading();
                fetch('clear-cache.php?type=logs')
                    .then(response => response.json())
                    .then(data => showResult(data))
                    .catch(error => showResult({error: error.message}, true));
            }
        }

        function checkCacheStatus() {
            showLoading();
            fetch('cache-status.php')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('status-result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    document.getElementById('result').style.display = 'none';
                })
                .catch(error => showResult({error: error.message}, true));
        }
    </script>
</body>
</html>