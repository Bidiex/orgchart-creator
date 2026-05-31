import { useState, useCallback, useRef } from 'react'

export function useUndoRedo() {
  const historyRef = useRef({
    past: [],
    future: []
  })
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateFlags = useCallback(() => {
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current = {
      past: [],
      future: []
    }
    updateFlags()
  }, [updateFlags])

  const pushState = useCallback((currentState) => {
    if (!currentState) return

    const { past } = historyRef.current
    
    // Check if state is identical to last past state to avoid redundant entries
    if (past.length > 0) {
      const lastPast = past[past.length - 1]
      const lastStr = JSON.stringify({
        nodes: lastPast.nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
        edges: lastPast.edges
      })
      const currentStr = JSON.stringify({
        nodes: currentState.nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
        edges: currentState.edges
      })

      if (lastStr === currentStr) {
        return
      }
    }

    // Push to past
    past.push(currentState)
    if (past.length > 50) {
      past.shift() // FIFO: limit to 50 states
    }

    // Reset future
    historyRef.current.future = []

    updateFlags()
  }, [updateFlags])

  const undo = useCallback((currentState) => {
    const { past, future } = historyRef.current
    if (past.length === 0) return null

    const previous = past.pop()
    
    // Push current state to future for redo
    if (currentState) {
      future.unshift(currentState)
    }

    updateFlags()
    return previous
  }, [updateFlags])

  const redo = useCallback((currentState) => {
    const { past, future } = historyRef.current
    if (future.length === 0) return null

    const next = future.shift()

    // Push current state to past for undo
    if (currentState) {
      past.push(currentState)
      if (past.length > 50) {
        past.shift()
      }
    }

    updateFlags()
    return next
  }, [updateFlags])

  const cleanLastHistoryIfIdentical = useCallback((currentState) => {
    if (!currentState) return

    const { past } = historyRef.current
    if (past.length === 0) return

    const lastPast = past[past.length - 1]
    const lastStr = JSON.stringify({
      nodes: lastPast.nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
      edges: lastPast.edges
    })
    const currentStr = JSON.stringify({
      nodes: currentState.nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
      edges: currentState.edges
    })

    if (lastStr === currentStr) {
      past.pop()
      updateFlags()
    }
  }, [updateFlags])

  return {
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    clearHistory,
    cleanLastHistoryIfIdentical
  }
}
