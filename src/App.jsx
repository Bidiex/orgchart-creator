import React, { useState } from 'react'
import ProjectList from './pages/ProjectList'
import Editor from './pages/Editor'
import { useTheme } from './hooks/useTheme'

function App() {
  const [view, setView] = useState('list') // 'list' | 'editor'
  const [currentProjectId, setCurrentProjectId] = useState(null)

  // Inicializar useTheme al arrancar para aplicar el tema guardado
  useTheme()

  const handleOpenProject = (id) => {
    setCurrentProjectId(id)
    setView('editor')
  }

  const handleBackToDashboard = () => {
    setCurrentProjectId(null)
    setView('list')
  }

  if (view === 'editor' && currentProjectId) {
    return (
      <Editor
        projectId={currentProjectId}
        onBack={handleBackToDashboard}
      />
    )
  }

  return (
    <ProjectList
      onOpenProject={handleOpenProject}
    />
  )
}

export default App
