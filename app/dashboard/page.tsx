export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            color: "#0f172a",
            marginBottom: "10px",
          }}
        >
          🚗 Garaj Defteri
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "18px",
            marginBottom: "40px",
          }}
        >
          Hoş geldiniz.
        </p>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>🚘 Araçlarım</h2>

          <p>Henüz araç eklemediniz.</p>

          <button
            style={{
              marginTop: "20px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "14px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            + Araç Ekle
          </button>
        </div>
      </div>
    </main>
  );
}