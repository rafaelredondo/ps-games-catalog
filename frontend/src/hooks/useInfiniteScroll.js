import { useState, useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(fetchFunction, options = {}) {
  const {
    limit = 20,
    search = '',
    platform = '',
    orderBy = 'name',  // Campo para ordenação (name, metacritic, year, etc.)
    order = 'asc',     // Direção da ordenação (asc/desc)
    // Filtros avançados
    minMetacritic = '',
    genre = '',
    publisher = '',
    status = ''
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
  const scrollPositionRef = useRef(0)
  const isLoadingRef = useRef(false)

  // Estado derivado
  const hasMore = pagination.hasNext

  // Função para preservar posição do scroll
  const preserveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.pageYOffset
  }, [])

  // Função para restaurar posição do scroll
  const restoreScrollPosition = useCallback(() => {
    if (scrollPositionRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current)
      })
    }
  }, [])

  // Função para fazer fetch dos dados
  const fetchGames = useCallback(async (page = 1, reset = false) => {
    if (isLoadingRef.current) return
    
    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    // Preservar posição se não for reset
    if (!reset && page > 1) {
      preserveScrollPosition()
    }

    try {
      const response = await fetchFunction({
        page,
        limit,
        search,
        platform,
        orderBy,
        order,
        // Filtros avançados
        minMetacritic,
        genre,
        publisher,
        status
      })

      setGames(prevGames => {
        if (reset || page === 1) {
          return response.games
        }
        // Usar uma abordagem mais eficiente para adicionar novos jogos
        const newGames = response.games.filter(newGame => 
          !prevGames.some(existingGame => existingGame.id === newGame.id)
        )
        return [...prevGames, ...newGames]
      })

      setPagination(response.pagination)
      currentPageRef.current = page

      // Restaurar posição se necessário
      if (!reset && page > 1) {
        setTimeout(restoreScrollPosition, 50)
      }

    } catch (err) {
      setError(err.message || 'Erro ao carregar jogos')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [fetchFunction, limit, search, platform, orderBy, order, minMetacritic, genre, publisher, status, preserveScrollPosition, restoreScrollPosition])

  // Função para carregar mais jogos
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoadingRef.current) {
      const nextPage = currentPageRef.current + 1
      await fetchGames(nextPage, false)
    }
  }, [hasMore, fetchGames])

  // Função para refresh (resetar)
  const refresh = useCallback(async () => {
    currentPageRef.current = 1
    scrollPositionRef.current = 0
    await fetchGames(1, true)
  }, [fetchGames])

  // IntersectionObserver melhorado com throttling para detectar fim da lista
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let throttleTimer = null

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        
        // Throttle para evitar múltiplas execuções muito próximas
        if (throttleTimer) return
        
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          throttleTimer = setTimeout(() => {
            // Verificação dupla para garantir que ainda é necessário carregar
            if (hasMore && !isLoadingRef.current && entry.isIntersecting) {
              loadMore()
            }
            throttleTimer = null
          }, 200) // Delay otimizado para melhor experiência
        }
      },
      {
        rootMargin: '50px', // Margem otimizada
        threshold: 0.1, // Threshold para detecção precisa
        root: null // Usar viewport como root
      }
    )

    observer.observe(sentinel)

    return () => {
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
      observer.unobserve(sentinel)
      observer.disconnect()
    }
  }, [hasMore, loadMore])

  // Carregamento inicial
  useEffect(() => {
    currentPageRef.current = 1
    fetchGames(1, true)
  }, [search, platform, orderBy, order, minMetacritic, genre, publisher, status]) // Recarrega quando filtros ou ordenação mudam (reset para página 1)

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