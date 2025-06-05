import { useState, useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(fetchFunction, options = {}) {
  const {
    limit = 20,
    search = '',
    platform = ''
  } = options

  // Estados
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Refs
  const sentinelRef = useRef(null)
  const currentPageRef = useRef(1)

  // Estado derivado
  const hasMore = pagination.hasNext

  // Função para fazer fetch dos dados
  const fetchGames = useCallback(async (page = 1, reset = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetchFunction({
        page,
        limit,
        search,
        platform
      })

      setGames(prevGames => {
        if (reset || page === 1) {
          return response.games
        }
        return [...prevGames, ...response.games]
      })

      setPagination(response.pagination)
      currentPageRef.current = page

    } catch (err) {
      setError(err.message || 'Erro ao carregar jogos')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, limit, search, platform, loading])

  // Função para carregar mais jogos
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      const nextPage = currentPageRef.current + 1
      await fetchGames(nextPage, false)
    }
  }, [hasMore, loading, fetchGames])

  // Função para refresh (resetar)
  const refresh = useCallback(async () => {
    currentPageRef.current = 1
    await fetchGames(1, true)
  }, [fetchGames])

  // IntersectionObserver para detectar fim da lista
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      {
        rootMargin: '100px', // Carrega antes de chegar no fim
        threshold: 0.1
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.unobserve(sentinel)
      observer.disconnect()
    }
  }, [hasMore, loading, loadMore])

  // Carregamento inicial
  useEffect(() => {
    fetchGames(1, true)
  }, [search, platform]) // Recarrega quando filtros mudam

  return {
    games,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    sentinelRef,
    pagination
  }
} 