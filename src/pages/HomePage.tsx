import { Link } from 'react-router-dom'
import './HomePage.css'


function HomePage() {
  return (
    <div className="home-page">

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <header className="home-nav">

        <Link
          to="/"
          className="home-logo"
        >
          Tutoro
        </Link>

        <nav className="home-nav-actions">

          <Link
            to="/login"
            className="home-login-link"
          >
            Sign in
          </Link>

          <Link
            to="/signup"
            className="home-get-started"
          >
            Get started
          </Link>

        </nav>

      </header>


      {/* =========================================
          HERO
      ========================================= */}

      <main>

        <section className="home-hero">

          <div className="home-hero-content">

            <span className="home-eyebrow">
              TUTORING, ORGANIZED
            </span>

            <h1>
              Less admin.
              <br />
              More teaching.
            </h1>

            <p className="home-hero-description">
              Keep classes, sessions, student
              preparation and resources together
              in one simple place.
            </p>

            <div className="home-hero-actions">

              <Link
                to="/signup"
                className="home-primary-button"
              >
                Get started
                <span>→</span>
              </Link>

              <Link
                to="/login"
                className="home-secondary-button"
              >
                Sign in
              </Link>

            </div>

          </div>


          {/* PRODUCT PREVIEW */}

          <div className="home-preview">

            <div className="home-preview-top">

              <div>
                <span className="home-preview-label">
                  NEXT SESSION
                </span>

                <h3>
                  Mathematics
                </h3>
              </div>

              <div className="home-preview-date">
                <span>SEP</span>
                <strong>28</strong>
              </div>

            </div>


            <div className="home-preview-time">
              <span className="home-time-dot" />
              4:00 PM – 5:00 PM
            </div>


            <div className="home-preview-divider" />


            <div className="home-preview-student">

              <div className="home-preview-avatar">
                S
              </div>

              <div>
                <span>
                  STUDENT PREPARATION
                </span>

                <strong>
                  Sarah
                </strong>

                <p>
                  I need help understanding
                  quadratic equations.
                </p>
              </div>

            </div>


            <div className="home-preview-file">

              <div className="home-preview-file-icon">
                PDF
              </div>

              <div>
                <strong>
                  worksheet.pdf
                </strong>

                <span>
                  Ready for your session
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            FEATURES
        ========================================= */}

        <section className="home-features">

          <div className="home-section-heading">

            <span className="home-eyebrow">
              EVERYTHING IN ONE PLACE
            </span>

            <h2>
              Tutoring shouldn't come with
              an admin headache.
            </h2>

          </div>


          <div className="home-feature-grid">

            <div className="home-feature-card feature-lavender">

              <span className="home-feature-number">
                01
              </span>

              <h3>
                Organize your classes
              </h3>

              <p>
                Keep students, subjects and
                class information together
                instead of scattered across
                different tools.
              </p>

            </div>


            <div className="home-feature-card feature-yellow">

              <span className="home-feature-number">
                02
              </span>

              <h3>
                Plan your sessions
              </h3>

              <p>
                Schedule upcoming lessons and
                see exactly what's coming up
                from your dashboard.
              </p>

            </div>


            <div className="home-feature-card feature-blue">

              <span className="home-feature-number">
                03
              </span>

              <h3>
                Arrive prepared
              </h3>

              <p>
                Students can tell you what they
                need help with and upload their
                resources before the lesson.
              </p>

            </div>

          </div>

        </section>


        {/* =========================================
            TUTOR + STUDENT
        ========================================= */}

        <section className="home-for-everyone">

          <div className="home-section-heading">

            <span className="home-eyebrow">
              BUILT FOR BOTH SIDES
            </span>

            <h2>
              Students arrive prepared.
              <br />
              Tutors arrive ready.
            </h2>

          </div>


          <div className="home-role-grid">

            <div className="home-role-card">

              <span className="home-role-label">
                FOR TUTORS
              </span>

              <h3>
                Your tutoring,
                under control.
              </h3>

              <ul>
                <li>Create and manage classes</li>
                <li>Schedule tutoring sessions</li>
                <li>See upcoming lessons</li>
                <li>Review student preparation</li>
                <li>Open student resources</li>
              </ul>

            </div>


            <div className="home-role-card home-role-card-student">

              <span className="home-role-label">
                FOR STUDENTS
              </span>

              <h3>
                Know what's next.
                Come prepared.
              </h3>

              <ul>
                <li>Join with a simple class code</li>
                <li>See upcoming sessions</li>
                <li>Tell your tutor what you need</li>
                <li>Upload worksheets and resources</li>
                <li>Keep everything in one place</li>
              </ul>

            </div>

          </div>

        </section>


        {/* =========================================
            FINAL CTA
        ========================================= */}

        <section className="home-cta">

          <span className="home-eyebrow">
            READY WHEN YOU ARE
          </span>

          <h2>
            Make your next tutoring
            session easier.
          </h2>

          <p>
            Spend less time organizing and
            more time actually teaching.
          </p>

          <Link
            to="/signup"
            className="home-primary-button"
          >
            Get started
            <span>→</span>
          </Link>

        </section>

      </main>


      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="home-footer">

        <strong>
          Tutoro
        </strong>

        <span>
          Your tutoring, organized.
        </span>

      </footer>

    </div>
  )
}

export default HomePage