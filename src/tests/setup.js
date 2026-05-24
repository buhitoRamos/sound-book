import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] ?? null,
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) { this.callback = callback }
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'IntersectionObserver', { value: IntersectionObserverMock })

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverMock })

// Mock window.history.pushState
if (!window.history.pushState) {
  window.history.pushState = () => {}
}

// Suppress console.warn and console.error in tests
const originalWarn = console.warn
const originalError = console.error
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router')) return
    originalWarn(...args)
  }
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('Warning:') || args[0].includes('act('))) return
    originalError(...args)
  }
})
afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})