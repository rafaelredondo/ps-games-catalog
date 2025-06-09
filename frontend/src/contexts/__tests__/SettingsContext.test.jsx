import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { SettingsProvider, useSettings } from '../SettingsContext'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('🚀 SettingsContext - TDD Baby Steps', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('🔴 RED: Context básico deve existir e fornecer configurações padrão', () => {
    
    test('should provide default settings', () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      // Verificar configurações padrão
      expect(result.current.settings).toEqual({
        infiniteScrollEnabled: true,
        itemsPerPage: 20,
        theme: 'dark'
      })
      expect(result.current.updateSetting).toBeInstanceOf(Function)
      expect(result.current.resetSettings).toBeInstanceOf(Function)
    })

    test('should throw error when used outside provider', () => {
      // Capturar erro do console
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useSettings())
      }).toThrow('useSettings deve ser usado dentro de um SettingsProvider')
      
      consoleSpy.mockRestore()
    })

  })

  describe('🟢 GREEN: Deve atualizar configurações corretamente', () => {
    
    test('should update infinite scroll setting', () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      act(() => {
        result.current.updateSetting('infiniteScrollEnabled', false)
      })

      expect(result.current.settings.infiniteScrollEnabled).toBe(false)
      expect(result.current.settings.itemsPerPage).toBe(20) // Outros mantidos
      expect(result.current.settings.theme).toBe('dark') // Outros mantidos
    })

    test('should update multiple settings independently', () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      act(() => {
        result.current.updateSetting('itemsPerPage', 50)
      })

      act(() => {
        result.current.updateSetting('theme', 'light')
      })

      expect(result.current.settings).toEqual({
        infiniteScrollEnabled: true,
        itemsPerPage: 50,
        theme: 'light'
      })
    })

    test('should reset settings to defaults', () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      // Primeiro, alterar algumas configurações
      act(() => {
        result.current.updateSetting('infiniteScrollEnabled', false)
        result.current.updateSetting('itemsPerPage', 50)
      })

      // Verificar que mudaram
      expect(result.current.settings.infiniteScrollEnabled).toBe(false)
      expect(result.current.settings.itemsPerPage).toBe(50)

      // Resetar para padrões
      act(() => {
        result.current.resetSettings()
      })

      // Verificar que voltaram ao padrão
      expect(result.current.settings).toEqual({
        infiniteScrollEnabled: true,
        itemsPerPage: 20,
        theme: 'dark'
      })
    })

  })

  describe('🔄 REFACTOR: Deve persistir configurações no localStorage', () => {
    
    test('should load settings from localStorage on mount', () => {
      const savedSettings = {
        infiniteScrollEnabled: false,
        itemsPerPage: 30,
        theme: 'light'
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings))

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      expect(result.current.settings).toEqual(savedSettings)
    })

    test('should save settings to localStorage when updated', () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      act(() => {
        result.current.updateSetting('infiniteScrollEnabled', false)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ps-games-settings',
        JSON.stringify({
          infiniteScrollEnabled: false,
          itemsPerPage: 20,
          theme: 'dark'
        })
      )
    })

    test('should handle corrupted localStorage gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      // Deve usar configurações padrão quando JSON é inválido
      expect(result.current.settings).toEqual({
        infiniteScrollEnabled: true,
        itemsPerPage: 20,
        theme: 'dark'
      })

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar configurações:', expect.any(SyntaxError))
      
      consoleSpy.mockRestore()
    })

  })

}) 