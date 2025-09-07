export default function SimpleTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '20px' }}>
          SUCCESS!
        </h1>
        <p style={{ fontSize: '24px', color: '#666' }}>
          BiteBase Intelligence Landing Page Working!
        </p>
        <p style={{ fontSize: '18px', color: '#888', marginTop: '20px' }}>
          All dependencies updated successfully
        </p>
      </div>
    </div>
  )
}