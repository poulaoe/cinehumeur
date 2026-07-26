export function Navbar() {
  return `
    <nav class="navbar">
      <div class="navbar__left">

        <div class="logo">
            🎬
        </div>

        <div class="brand">
            <h1>CinéHumeur</h1>
            <span>Découvre le film parfait</span>
        </div>

      </div>

      <div class="navbar__center">

        <button class="nav-link active">
            Accueil
        </button>

        <button class="nav-link">
            Découvrir
        </button>

        <button class="nav-link">
            Watchlist
        </button>

        <button class="nav-link">
            Favoris
        </button>

      </div>

      <div class="navbar__right">

        <button class="icon-button">
            🔍
        </button>

        <button class="icon-button">
            ❤️
        </button>

        <button class="profile-button">

            <div class="avatar">
                P
            </div>

        </button>

      </div>

    </nav>
  `;
}