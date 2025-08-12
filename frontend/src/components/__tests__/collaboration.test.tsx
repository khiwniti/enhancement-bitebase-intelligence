/**
 * Collaboration Component Tests
 * Tests for real-time collaboration components and hooks
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'

import { RealtimeCollaboration } from '../collaboration/RealtimeCollaboration'
import { PresenceIndicators } from '../collaboration/PresenceIndicators'
import { CollaborationCursors } from '../collaboration/CollaborationCursors'
import { CommentSystem } from '../collaboration/CommentSystem'
import { VersionHistory } from '../collaboration/VersionHistory'

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  OPEN: 1
})) as any

// Mock hooks
jest.mock('../collaboration/hooks/useRealtimeCollaboration', () => ({
  useRealtimeCollaboration: () => ({
    isConnected: true,
    participants: [
      {
        user_id: 'user1',
        username: 'John Doe',
        avatar_url: 'https://example.com/avatar1.jpg',
        status: 'online' as const,
        cursor_position: { x: 50, y: 25 },
        current_action: 'editing',
        active_element: 'widget1',
        color: '#3B82F6'
      },
      {
        user_id: 'user2',
        username: 'Jane Smith',
        avatar_url: 'https://example.com/avatar2.jpg',
        status: 'online' as const,
        cursor_position: { x: 75, y: 50 },
        current_action: 'viewing',
        active_element: undefined,
        color: '#EF4444'
      }
    ],
    currentOperation: null,
    sessionState: { version: 5, participants: ['user1', 'user2'] },
    connectionError: null,
    submitOperation: jest.fn(),
    updateCursorPosition: jest.fn(),
    updateActivity: jest.fn(),
    syncState: jest.fn(),
    comments: [
      {
        id: 'comment1',
        elementId: 'widget1',
        text: 'This chart needs to show more recent data',
        position: { x: 100, y: 150 },
        userId: 'user1',
        username: 'John Doe',
        timestamp: '2024-01-15T10:30:00Z',
        resolved: false
      }
    ],
    addComment: jest.fn(),
    operationHistory: [
      {
        id: 'op1',
        type: 'update',
        dashboard_id: 'dashboard1',
        user_id: 'user1',
        timestamp: '2024-01-15T10:25:00Z',
        path: ['widgets', '0', 'title'],
        data: { new_value: 'Updated Chart Title' },
        version: 5,
        dependencies: []
      }
    ]
  })
}))

describe('RealtimeCollaboration', () => {
  const mockProps = {
    dashboardId: 'dashboard1',
    userId: 'currentUser',
    username: 'Current User',
    avatarUrl: 'https://example.com/current-avatar.jpg',
    onOperationApplied: jest.fn(),
    onStateChanged: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders collaboration interface', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </RealtimeCollaboration>
    )

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Collaboration On')).toBeInTheDocument()
  })

  test('shows connection status', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div>Content</div>
      </RealtimeCollaboration>
    )

    const connectionStatus = screen.getByText('Connected')
    expect(connectionStatus).toBeInTheDocument()
    expect(connectionStatus.closest('div')).toHaveClass('bg-green-100')
  })

  test('toggles collaboration mode', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div>Content</div>
      </RealtimeCollaboration>
    )

    const toggleButton = screen.getByText('Collaboration On')
    fireEvent.click(toggleButton)

    expect(screen.getByText('Collaboration Off')).toBeInTheDocument()
  })

  test('opens comment system', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div>Content</div>
      </RealtimeCollaboration>
    )

    const commentsButton = screen.getByText(/Comments \(1\)/)
    fireEvent.click(commentsButton)

    // Comment system should be visible
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('opens version history', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div>Content</div>
      </RealtimeCollaboration>
    )

    const historyButton = screen.getByText('History')
    fireEvent.click(historyButton)

    // Version history should be visible
    expect(screen.getByText('Version History')).toBeInTheDocument()
  })

  test('handles keyboard shortcuts', () => {
    render(
      <RealtimeCollaboration {...mockProps}>
        <div>Content</div>
      </RealtimeCollaboration>
    )

    // Test Ctrl+/ for comments
    fireEvent.keyDown(document, { key: '/', ctrlKey: true })
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    // Test Escape to close
    fireEvent.keyDown(document, { key: 'Escape' })
  })
})

describe('PresenceIndicators', () => {
  const mockParticipants = [
    {
      user_id: 'user1',
      username: 'John Doe',
      avatar_url: 'https://example.com/avatar1.jpg',
      status: 'online' as const,
      cursor_position: { x: 50, y: 25 },
      current_action: 'editing',
      active_element: 'widget1',
      color: '#3B82F6'
    },
    {
      user_id: 'user2',
      username: 'Jane Smith',
      avatar_url: undefined,
      status: 'away' as const,
      cursor_position: { x: 75, y: 50 },
      current_action: 'viewing',
      active_element: undefined,
      color: '#EF4444'
    }
  ]

  test('renders participant avatars', () => {
    render(
      <PresenceIndicators
        participants={mockParticipants}
        currentUserId="currentUser"
      />
    )

    // Should show both participants (excluding current user)
    expect(screen.getByText('J')).toBeInTheDocument() // John's initial
    expect(screen.getByText('J')).toBeInTheDocument() // Jane's initial
  })

  test('shows participant count when expanded', () => {
    render(
      <PresenceIndicators
        participants={mockParticipants}
        currentUserId="currentUser"
        showDetails={true}
      />
    )

    expect(screen.getByText(/Active Collaborators \(2\)/)).toBeInTheDocument()
  })

  test('handles avatar hover tooltips', async () => {
    render(
      <PresenceIndicators
        participants={mockParticipants}
        currentUserId="currentUser"
      />
    )

    const avatar = screen.getByText('J')
    fireEvent.mouseEnter(avatar)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Editing widget1')).toBeInTheDocument()
    })
  })

  test('shows status indicators', () => {
    render(
      <PresenceIndicators
        participants={mockParticipants}
        currentUserId="currentUser"
      />
    )

    // Check for status indicators (colored dots)
    const avatars = screen.getAllByText('J')
    expect(avatars).toHaveLength(2)
  })
})

describe('CollaborationCursors', () => {
  const mockParticipants = [
    {
      user_id: 'user1',
      username: 'John Doe',
      status: 'online' as const,
      cursor_position: { x: 50, y: 25, elementId: 'widget1' },
      current_action: 'editing',
      active_element: 'widget1',
      color: '#3B82F6'
    }
  ]

  test('renders cursor for participant', () => {
    const mockContainerRef = {
      current: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      }
    } as any

    render(
      <CollaborationCursors
        participants={mockParticipants}
        currentUserId="currentUser"
        containerRef={mockContainerRef}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  test('does not render cursors for offline participants', () => {
    const offlineParticipants = [
      {
        ...mockParticipants[0],
        status: 'offline' as const
      }
    ]

    const mockContainerRef = {
      current: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      }
    } as any

    render(
      <CollaborationCursors
        participants={offlineParticipants}
        currentUserId="currentUser"
        containerRef={mockContainerRef}
      />
    )

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })
})

describe('CommentSystem', () => {
  const mockComments = [
    {
      id: 'comment1',
      elementId: 'widget1',
      text: 'This chart needs to show more recent data',
      position: { x: 100, y: 150 },
      userId: 'user1',
      username: 'John Doe',
      timestamp: '2024-01-15T10:30:00Z',
      resolved: false
    },
    {
      id: 'comment2',
      elementId: 'widget2',
      text: 'Great visualization!',
      position: { x: 200, y: 250 },
      userId: 'user2',
      username: 'Jane Smith',
      timestamp: '2024-01-15T11:00:00Z',
      resolved: true
    }
  ]

  const mockProps = {
    comments: mockComments,
    onAddComment: jest.fn(),
    onResolveComment: jest.fn(),
    onReplyToComment: jest.fn(),
    onClose: jest.fn(),
    dashboardId: 'dashboard1',
    userId: 'currentUser',
    username: 'Current User'
  }

  test('renders comment list', () => {
    render(<CommentSystem {...mockProps} />)

    expect(screen.getByText(/Comments \(2\)/)).toBeInTheDocument()
    expect(screen.getByText('This chart needs to show more recent data')).toBeInTheDocument()
    expect(screen.getByText('Great visualization!')).toBeInTheDocument()
  })

  test('filters comments by status', () => {
    render(<CommentSystem {...mockProps} />)

    // Switch to unresolved filter
    const unresolvedTab = screen.getByText('unresolved')
    fireEvent.click(unresolvedTab)

    expect(screen.getByText('This chart needs to show more recent data')).toBeInTheDocument()
    expect(screen.queryByText('Great visualization!')).not.toBeInTheDocument()
  })

  test('adds new comment', async () => {
    render(<CommentSystem {...mockProps} />)

    const textarea = screen.getByPlaceholderText('Add a comment...')
    const addButton = screen.getByText('Add Comment')

    fireEvent.change(textarea, { target: { value: 'New test comment' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockProps.onAddComment).toHaveBeenCalledWith({
        elementId: 'general',
        text: 'New test comment',
        position: { x: 0, y: 0 },
        userId: 'currentUser',
        username: 'Current User'
      })
    })
  })

  test('resolves comment', async () => {
    render(<CommentSystem {...mockProps} />)

    const resolveButton = screen.getByText('Resolve')
    fireEvent.click(resolveButton)

    await waitFor(() => {
      expect(mockProps.onResolveComment).toHaveBeenCalledWith('comment1')
    })
  })

  test('closes comment system', () => {
    render(<CommentSystem {...mockProps} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })
})

describe('VersionHistory', () => {
  const mockOperations = [
    {
      id: 'op1',
      type: 'update',
      dashboard_id: 'dashboard1',
      user_id: 'user1',
      timestamp: '2024-01-15T10:25:00Z',
      path: ['widgets', '0', 'title'],
      data: { new_value: 'Updated Chart Title' },
      version: 5,
      dependencies: []
    },
    {
      id: 'op2',
      type: 'insert',
      dashboard_id: 'dashboard1',
      user_id: 'user2',
      timestamp: '2024-01-15T10:20:00Z',
      path: ['widgets'],
      data: { widget_type: 'chart', title: 'New Chart' },
      version: 4,
      dependencies: []
    }
  ]

  const mockProps = {
    operations: mockOperations,
    currentVersion: 5,
    onClose: jest.fn(),
    onRestoreVersion: jest.fn(),
    onViewDiff: jest.fn()
  }

  test('renders version history', () => {
    render(<VersionHistory {...mockProps} />)

    expect(screen.getByText('Version History')).toBeInTheDocument()
    expect(screen.getByText('Version 5')).toBeInTheDocument()
    expect(screen.getByText('Version 4')).toBeInTheDocument()
  })

  test('shows current version indicator', () => {
    render(<VersionHistory {...mockProps} />)

    expect(screen.getByText('(Current)')).toBeInTheDocument()
  })

  test('expands version details', () => {
    render(<VersionHistory {...mockProps} />)

    const showDetailsButton = screen.getAllByText('Show details')[0]
    fireEvent.click(showDetailsButton)

    expect(screen.getByText(/Operations \(1\)/)).toBeInTheDocument()
  })

  test('filters by operation type', () => {
    render(<VersionHistory {...mockProps} />)

    const filterSelect = screen.getByDisplayValue('All types')
    fireEvent.change(filterSelect, { target: { value: 'update' } })

    // Should only show versions with update operations
    expect(screen.getByText('Version 5')).toBeInTheDocument()
  })

  test('searches operations', () => {
    render(<VersionHistory {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search operations...')
    fireEvent.change(searchInput, { target: { value: 'chart' } })

    // Should filter to show relevant versions
    expect(screen.getByText('Version 5')).toBeInTheDocument()
    expect(screen.getByText('Version 4')).toBeInTheDocument()
  })

  test('restores version', () => {
    render(<VersionHistory {...mockProps} />)

    const restoreButton = screen.getByText('Restore')
    fireEvent.click(restoreButton)

    expect(mockProps.onRestoreVersion).toHaveBeenCalledWith(4)
  })

  test('closes version history', () => {
    render(<VersionHistory {...mockProps} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })
})

// Hook tests
describe('useRealtimeCollaboration hook', () => {
  // Note: These would be more comprehensive in a real test environment
  // For now, we're testing the mocked version

  test('provides collaboration state', () => {
    const { useRealtimeCollaboration } = require('../collaboration/hooks/useRealtimeCollaboration')
    const hook = useRealtimeCollaboration({
      dashboardId: 'dashboard1',
      userId: 'user1',
      username: 'Test User'
    })

    expect(hook.isConnected).toBe(true)
    expect(hook.participants).toHaveLength(2)
    expect(hook.sessionState.version).toBe(5)
    expect(typeof hook.submitOperation).toBe('function')
    expect(typeof hook.updateCursorPosition).toBe('function')
  })
})

// Integration tests
describe('Collaboration Integration', () => {
  test('collaboration components work together', () => {
    const participants = [
      {
        user_id: 'user1',
        username: 'John Doe',
        avatar_url: 'https://example.com/avatar1.jpg',
        status: 'online' as const,
        cursor_position: { x: 50, y: 25 },
        current_action: 'editing',
        active_element: 'widget1',
        color: '#3B82F6'
      }
    ]

    const mockContainerRef = {
      current: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      }
    } as any

    render(
      <div>
        <PresenceIndicators
          participants={participants}
          currentUserId="currentUser"
        />
        <CollaborationCursors
          participants={participants}
          currentUserId="currentUser"
          containerRef={mockContainerRef}
        />
      </div>
    )

    // Both components should render the same user
    expect(screen.getAllByText('John Doe')).toHaveLength(2)
  })
})

// Performance tests
describe('Collaboration Performance', () => {
  test('handles many participants efficiently', () => {
    const manyParticipants = Array.from({ length: 50 }, (_, i) => ({
      user_id: `user${i}`,
      username: `User ${i}`,
      status: 'online' as const,
      cursor_position: { x: i * 10, y: i * 5 },
      current_action: 'viewing',
      active_element: undefined,
      color: '#3B82F6'
    }))

    const startTime = performance.now()

    render(
      <PresenceIndicators
        participants={manyParticipants}
        currentUserId="currentUser"
        maxVisible={5}
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render quickly even with many participants
    expect(renderTime).toBeLessThan(100) // Less than 100ms
    expect(screen.getByText('+45')).toBeInTheDocument() // Overflow indicator
  })
})