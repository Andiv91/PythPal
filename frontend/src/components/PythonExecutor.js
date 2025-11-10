import React, { useState } from 'react';
import AceEditor from 'react-ace';
import { API_URL } from '../config';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const defaultCode = `print("Hello, World!")`;

export default function PythonExecutor({ expectedOutput = "Hello, World!", activityId }) {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveSubmission = async (outputToSave) => {
    if (!activityId) return;
    console.log('Guardando submission para actividad', activityId, 'con output:', outputToSave);
    try {
      await fetch(`${API_URL}/api/submissions/${activityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code,
          output: outputToSave,
        }),
      });
    } catch (err) {
      console.error('Error guardando submission:', err);
    }
  };
  const handleRun = async () => {
    console.log("¡Botón ejecutar presionado!");
    setLoading(true);
    setSuccess(false);
    setOutput('');
    try {
      const response = await fetch(`${API_URL}/api/python/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          language: 'python3',
          version: '3.10.0',
          code,
        }),
      });
      const data = await response.json();
      if (!data.output) {
        setOutput('Error en código, revísalo :)');
      } else if (expectedOutput && data.output.trim() === expectedOutput.trim()) {
        setSuccess(true);
        setOutput(data.output);
        await handleSaveSubmission(data.output); // Guarda el submission si es correcto
      } else {
        setSuccess(false);
        setOutput('Output no es el esperado, Intentalo de nuevo :)');
        await handleSaveSubmission(data.output); // También puedes guardar intentos fallidos si lo deseas
      }
    } catch (err) {
      setOutput('Error en código, revísalo :)');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#222', color: '#fff', borderRadius: 20, padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <AceEditor
        mode="python"
        theme="monokai"
        value={code}
        onChange={setCode}
        name="python_editor"
        width="100%"
        height="200px"
        fontSize={16}
        setOptions={{ useWorker: false }}
      />
      <button onClick={handleRun} disabled={loading} style={{ marginTop: 16, padding: '8px 24px', fontSize: 16, borderRadius: 8 }}>
        {loading ? 'Ejecutando...' : 'Ejecutar'}
      </button>
      <div style={{ marginTop: 16 }}>
        <strong>Output:</strong>
        <pre style={{ color: success ? 'lime' : '#fff', fontWeight: 'bold' }}>{output}</pre>
        {success && (
          <div style={{ color: 'lime', fontWeight: 'bold', fontSize: 18 }}>
            ¡Felicidades! 🎉
          </div>
        )}
      </div>
    </div>
  );
}