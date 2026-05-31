import React, { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import ProjectCard from '../components/projects/ProjectCard'
import EmptyState from '../components/shared/EmptyState'
import NewProjectModal from '../components/projects/NewProjectModal'
import { LayoutGrid, Plus, Loader2 } from 'lucide-react'

export default function ProjectList({ onOpenProject }) {
  const { projects, loading, createProject, deleteProject, duplicateProject } = useProjects()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateProject = (name, initialSnapshot = null) => {
    const newProject = createProject(name, initialSnapshot)
    if (newProject) {
      onOpenProject(newProject.id)
    }
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-primary flex flex-col">
      {/* Floating Pill Navbar / Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-6">
        <div className="flex items-center justify-between bg-surface border border-border-custom px-6 py-4 rounded-custom-pill shadow-custom-default">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2 rounded-custom-sm text-primary">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-text-primary mr-1">OrgChart Studio</span>
            {!loading && (
              <span className="text-xs bg-bg-muted border border-border-custom text-text-secondary px-2.5 py-1 rounded-custom-pill font-medium">
                {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-custom-pill text-sm font-medium shadow-custom-default hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Proyecto</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col gap-8">
          {/* Dashboard Intro */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Mis Organigramas</h1>
            <p className="text-sm text-text-secondary mt-1.5">
              Crea, gestiona y audita las estructuras organizacionales de tu empresa.
            </p>
          </div>

          {/* Projects Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-secondary">Cargando proyectos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12">
              <EmptyState onCreateClick={() => setIsModalOpen(true)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={onOpenProject}
                  onDelete={deleteProject}
                  onDuplicate={duplicateProject}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-border-custom text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} OrgChart Studio. Todos los datos se guardan de forma segura en tu navegador local (localStorage).
        </p>
      </footer>

      {/* Modal para crear nuevo proyecto */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
