import { useEffect, useState } from 'react'

function App() {
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/usuarios')
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error('Erro ao buscar usuários:', err))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Aplicação 3-Tier Rodando! 🚀</h1>
      <h2>Usuários do Banco:</h2>
      {usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado (Tabela vazia).</p>
      ) : (
        <ul>
          {usuarios.map((u, i) => (
            <li key={i}>{JSON.stringify(u)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
