import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = 'http://localhost:8081';
const SET_CONFIG_URL = `${API_BASE}/api/config/set`;
const START_PROCESS_URL = `${API_BASE}/api/process/start`;

export default function ProcessPage() {
	const navigate = useNavigate();
	const [files, setFiles] = useState([]);
	const [config, setConfig] = useState(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		try {
			const filesStr = sessionStorage.getItem('uploadedFilesPreview');
			const configStr = sessionStorage.getItem('processingConfig');

			if (filesStr) setFiles(JSON.parse(filesStr));
			if (configStr) setConfig(JSON.parse(configStr));
		} catch (e) {
			console.error('Failed to retrieve data from sessionStorage:', e);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSubmitToBackend = async () => {
		setError(null);

		if (!config) {
			setError('Configuration missing');
			return;
		}

		// Build board_quantities mapping: set same boardQty for each file
		const board_quantities = {};
		(files || []).forEach((f) => {
			board_quantities[f.filename] = config.boardQty ?? 1;
		});

		try {
			// 1) Set configuration
			const cfgResp = await fetch(SET_CONFIG_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					board_quantities,
					price_per_smd: config.priceSMD,
					price_per_pth: config.pricePTH,
				}),
			});

			if (!cfgResp.ok) {
				const txt = await cfgResp.text();
				throw new Error(txt || 'Failed to save configuration');
			}

			// 2) Start processing — this may take time, show processing state
			setProcessing(true);
			setResult(null);

			const procResp = await fetch(START_PROCESS_URL, { method: 'POST' });

			if (!procResp.ok) {
				const txt = await procResp.text();
				throw new Error(txt || 'Processing failed');
			}

			const procData = await procResp.json();
			setResult(procData);

			// Check the status from backend response
			if (procData.status === 'error') {
				setError(procData.msg || 'Processing error');
				return;
			}

			// If missing components found, go to missing page
			if (procData.status === 'missing') {
				sessionStorage.setItem('missingComponents', JSON.stringify(procData.missing || []));
				navigate('/missing', { replace: true });
				return;
			}

			// If success, route to result page
			if (procData.status === 'success') {
				sessionStorage.setItem('processResult', JSON.stringify(procData));
				navigate('/result', { replace: true });
				return;
			}

		} catch (e) {
			setError(String(e));
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className="container">
				<h1>⏳ Getting Everything Ready...</h1>
				<div className="info-section"><p>Retrieving configuration...</p></div>
			</div>
		);
	}

	return (
		<div className="container">
			<h1>📋 Let's Process Your BOMs</h1>

			{/* Configuration Section */}
			{config && (
				<div className="process-section">
					<h2>⚙️ Configuration</h2>
					<div className="config-summary">
						<div className="summary-item">
							<strong>Price per pin (SMD):</strong> {config.priceSMD.toFixed(4)}
						</div>
						<div className="summary-item">
							<strong>Price per pin (PTH):</strong> {config.pricePTH.toFixed(4)}
						</div>
						<div className="summary-item">
							<strong>Board Quantity:</strong> {config.boardQty}
						</div>
						<div className="summary-item">
							<strong>Configured at:</strong> {new Date(config.timestamp).toLocaleString()}
						</div>
					</div>
				</div>
			)}

			{/* Uploaded Files & Headers Section */}
			{files.length > 0 ? (
				<div className="process-section">
					<h2>📁 Uploaded Files</h2>
					{files.map((file, idx) => (
						<div key={idx} className="file-result">
							<h3>{file.filename}</h3>

							{file.error ? (
								<p className="error">❌ {file.error}</p>
							) : (
								<div>
									{/* Display headers from server */}
									{file.headers && file.headers.length > 0 && (
										<div>
											<p className="info">
												<strong>Headers:</strong> {file.headers.join(', ')}
											</p>
										</div>
									)}

									{/* Display first 5 rows from preview (from upload) */}
									{file.first5Rows && file.first5Rows.length > 0 && (
										<div>
											<p className="info">
												<strong>Preview (First 5 rows):</strong>
											</p>
											<div className="table-wrapper">
												<table>
													<thead>
														<tr>
															{Object.keys(file.first5Rows[0]).map((key) => (
																<th key={key}>{key}</th>
															))}
														</tr>
													</thead>
													<tbody>
														{file.first5Rows.map((row, ridx) => (
															<tr key={ridx}>
																{Object.values(row).map((val, cidx) => (
																	<td key={cidx}>{String(val)}</td>
																))}
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									)}

									{!file.headers && !file.first5Rows && (
										<p className="info">No data available for this file.</p>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="info-section">
					<p>No files uploaded. Go back to <a href="/upload">Upload</a>.</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="process-actions" style={{ marginTop: 20 }}>
				<button className="submit-btn" onClick={() => navigate('/review')} disabled={processing}>
					◀️ Back to Review
				</button>
				<button className="submit-btn" onClick={() => navigate('/config')} disabled={processing}>
					⚙️ Edit Config
				</button>
				<button
					className="submit-btn"
					style={{ background: processing ? '#999' : 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' }}
					onClick={handleSubmitToBackend}
					disabled={processing}
				>
					{processing ? '⏳ Processing...' : '✅ Start Processing'}
				</button>
			</div>

			{error && <div className="error-message"><p>{error}</p></div>}

			{result && (
				<div className="results-section" style={{ marginTop: 20 }}>
					<h2>✅ Result</h2>
					<div className="file-result">
						<p><strong>Status:</strong> {result.status}</p>
						<p><strong>Message:</strong> {result.message}</p>
						{result.processed_files && (
							<p><strong>Processed files:</strong> {result.processed_files.join(', ')}</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

