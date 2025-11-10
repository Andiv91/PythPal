import React from 'react';
import PythonExecutor from '../components/PythonExecutor';

export default function Home() {
  const expectedOutput = "Hello, World!";
  return (
    <>
      <h2>Ejercicio #1</h2>
      <p>
        Bienvenido a Python!<br />
        Comenzaremos con algo sencillo, el comando de imprimir, la función print() en Python muestra la salida en la consola u otros dispositivos de salida estándar...
        <br /><br />
        Es tu turno, escribe una línea de código que regrese un "Hello, World!"
      </p>
      <PythonExecutor expectedOutput={expectedOutput} />
    </>
  );
}