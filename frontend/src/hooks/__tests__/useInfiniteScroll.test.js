import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useInfiniteScroll } from '../useInfiniteScroll'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

describe('🚀 useInfiniteScroll Hook - TDD Baby Steps', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔴 RED: Hook básico deve existir e retornar estrutura inicial', () => {
    
    test('should exist and return initial state', () => {
      const mockFetchFunction = vi.fn().mockResolvedValue({
        games: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false }
      })

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { limit: 20 })
      )

      // Estrutura inicial esperada (loading: true pois faz fetch imediatamente)
      expect(result.current).toEqual({
        games: [],
        loading: true,
        hasMore: false, // Inicia com false até receber resposta
        error: null,
        loadMore: expect.any(Function),
        refresh: expect.any(Function),
        sentinelRef: expect.any(Object),
        pagination: expect.any(Object),
        currentPage: 1,
        totalPages: 0,
        isInfiniteScrollEnabled: true,
        totalGames: 0
      })
    })

    test('should call fetch function on mount', async () => {
      const mockFetchFunction = vi.fn().mockResolvedValue({
        games: [{ id: 1, name: 'Game 1' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false }
      })

      renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { limit: 20 })
      )

      // Deve chamar a função de fetch ao montar
      expect(mockFetchFunction).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: '',
        platform: '',
        orderBy: 'name',
        order: 'asc',
        minMetacritic: '',
        genre: '',
        publisher: '',
        status: '',
        infiniteScrollEnabled: true
      })
    })

    test('should update games state after successful fetch', async () => {
      const mockGames = [
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' }
      ]
      
      const mockFetchFunction = vi.fn().mockResolvedValue({
        games: mockGames,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNext: false }
      })

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { limit: 20 })
      )

      // Aguardar atualização do estado
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.games).toEqual(mockGames)
      expect(result.current.hasMore).toBe(false)
      expect(result.current.loading).toBe(false)
    })

    test('should handle loadMore function', async () => {
      const mockFetchFunction = vi.fn()
        .mockResolvedValueOnce({
          games: [{ id: 1, name: 'Game 1' }],
          pagination: { page: 1, limit: 1, total: 2, totalPages: 2, hasNext: true }
        })
        .mockResolvedValueOnce({
          games: [{ id: 2, name: 'Game 2' }],
          pagination: { page: 2, limit: 1, total: 2, totalPages: 2, hasNext: false }
        })

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { limit: 1 })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Primeira página carregada
      expect(result.current.games).toHaveLength(1)
      expect(result.current.hasMore).toBe(true)

      // Chamar loadMore
      await act(async () => {
        await result.current.loadMore()
      })

      // Segunda página deve ser adicionada aos jogos existentes
      expect(result.current.games).toHaveLength(2)
      expect(result.current.hasMore).toBe(false)
      expect(mockFetchFunction).toHaveBeenCalledTimes(2)
      expect(mockFetchFunction).toHaveBeenLastCalledWith({
        page: 2,
        limit: 1,
        search: '',
        platform: '',
        orderBy: 'name',
        order: 'asc',
        minMetacritic: '',
        genre: '',
        publisher: '',
        status: '',
        infiniteScrollEnabled: true
      })
    })

    test('should handle search and platform filters', async () => {
      const mockFetchFunction = vi.fn().mockResolvedValue({
        games: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false }
      })

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { 
          limit: 20, 
          search: 'batman', 
          platform: 'PlayStation 4' 
        })
      )

      expect(mockFetchFunction).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'batman',
        platform: 'PlayStation 4',
        orderBy: 'name',
        order: 'asc',
        minMetacritic: '',
        genre: '',
        publisher: '',
        status: '',
        infiniteScrollEnabled: true
      })
    })

    test('should handle refresh function', async () => {
      const mockFetchFunction = vi.fn().mockResolvedValue({
        games: [{ id: 1, name: 'Game 1' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false }
      })

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { limit: 20 })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Deve ter carregado inicialmente
      expect(mockFetchFunction).toHaveBeenCalledTimes(1)

      // Chamar refresh
      await act(async () => {
        await result.current.refresh()
      })

      // Deve reiniciar da página 1
      expect(mockFetchFunction).toHaveBeenCalledTimes(2)
      expect(mockFetchFunction).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        search: '',
        platform: '',
        orderBy: 'name',
        order: 'asc',
        minMetacritic: '',
        genre: '',
        publisher: '',
        status: '',
        infiniteScrollEnabled: true
      })
    })

    test('should handle infinite scroll disabled', async () => {
      // Mock do backend retornando array simples (sem paginação)
      const mockGames = [
        { id: 1, name: 'Game 1' },
        { id: 2, name: 'Game 2' },
        { id: 3, name: 'Game 3' }
      ]
      
      const mockFetchFunction = vi.fn().mockResolvedValue(mockGames)

      const { result } = renderHook(() => 
        useInfiniteScroll(mockFetchFunction, { 
          limit: 20, 
          enabled: false 
        })
      )

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // Verificar que não enviou parâmetros de paginação
      expect(mockFetchFunction).toHaveBeenCalledWith({
        search: '',
        platform: '',
        orderBy: 'name',
        order: 'asc',
        minMetacritic: '',
        genre: '',
        publisher: '',
        status: '',
        infiniteScrollEnabled: false
      })

      // Verificar que carregou todos os jogos
      expect(result.current.games).toEqual(mockGames)
      expect(result.current.hasMore).toBe(false)
      expect(result.current.isInfiniteScrollEnabled).toBe(false)
      expect(result.current.totalGames).toBe(3)
      expect(result.current.loading).toBe(false)
    })

  })

}) 