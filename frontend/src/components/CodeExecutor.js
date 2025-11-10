import React, { useState } from 'react';
import AceEditor from 'react-ace';
import { API_URL } from '../config';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';

const defaultSnippets = {
  python: 'print("Hello, World!")',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main(){\n  cout << "Hello, World!" << endl;\n  return 0;\n}'
};

const aceModeByLang = {
  python: 'python',
  java: 'java',
  cpp: 'c_cpp'
};

// Map our stored language to Piston language id + suggested version (optional)
function mapToPiston(language) {
  switch ((language || 'python').toLowerCase()) {
    case 'python':
      return { language: 'python3', version: '3.10.0' };
    case 'java':
      return { language: 'java' }; // let Piston pick default version
    case 'cpp':
      return { language: 'cpp' }; // let Piston pick default version
    default:
      return { language: 'python3', version: '3.10.0' };
  }
}

export default function CodeExecutor({ expectedOutput = 'Hello, World!', activityId, language = 'python' }) {
  const normalized = (language || 'python').toLowerCase();
  const [code, setCode] = useState(defaultSnippets[normalized] || defaultSnippets.python);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [startedAt]);

  const handleSaveSubmission = async (outputToSave) => {
    if (!activityId) return;
    try {
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      await fetch(`${API_URL}/api/submissions/${activityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, output: outputToSave, durationSeconds }),
      });
    } catch (err) {
      // silent
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setSuccess(false);
    setOutput('');
    const exec = mapToPiston(normalized);
    try {
      const response = await fetch(`${API_URL}/api/python/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language: exec.language, version: exec.version, code }),
      });
      const data = await response.json();
      if (!data.output) {
        setOutput('Error en código, revísalo :)');
      } else if (expectedOutput && data.output.trim() === expectedOutput.trim()) {
        setSuccess(true);
        setOutput(data.output);
        await handleSaveSubmission(data.output);
        setSuccessOpen(true);
      } else {
        setSuccess(false);
        setOutput('Output no es el esperado, Intentalo de nuevo :)');
        await handleSaveSubmission(data.output);
      }
    } catch (err) {
      setOutput('Error en código, revísalo :)');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#222', color: '#fff', borderRadius: 20, padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <AceEditor
        mode={aceModeByLang[normalized] || 'python'}
        theme="monokai"
        value={code}
        onChange={setCode}
        name="code_executor_editor"
        width="100%"
        height="240px"
        fontSize={16}
        setOptions={{ useWorker: false }}
      />
      <button onClick={handleRun} disabled={loading} style={{ marginTop: 16, padding: '8px 24px', fontSize: 16, borderRadius: 8 }}>
        {loading ? 'Ejecutando...' : 'Ejecutar'}
      </button>
      <div style={{ marginTop: 8, color: '#ccc' }}>Tiempo: {elapsed}s</div>
      <div style={{ marginTop: 16 }}>
        <strong>Output:</strong>
        <pre style={{ color: success ? 'lime' : '#fff', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{output}</pre>
      </div>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ¡Felicidades, completaste el ejercicio! 😄
          <IconButton aria-label="close" onClick={() => setSuccessOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Excelente trabajo. Puedes intentar otro ejercicio o mejorar tu solución.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


