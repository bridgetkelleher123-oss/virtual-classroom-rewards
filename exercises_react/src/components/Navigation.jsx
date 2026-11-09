import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <nav className="app-nav">
            <Link to="/">Class Roster</Link>
            <Link to="/add-student">Add a Student</Link>
            <Link to="/login">Sign In</Link>
        </nav>
    );
}

export default Navigation;