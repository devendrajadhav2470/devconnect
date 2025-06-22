// import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
// import { NavLink, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// const DevConnectNavBar = () => {
//   const { user, logout } = useAuth();
//   console.log("DevConnectNavBar user:", user);
//   console.log(user?.image)
//   return (
//   <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
//     <Container>
//       {/* Logo and Brand */}
//       <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
//         <i className="bi bi-people-fill me-2" style={{ fontSize: 28 }}></i>
//         DevConnect
//       </Navbar.Brand>
//       <Navbar.Toggle aria-controls="devconnect-navbar" />
//       <Navbar.Collapse id="devconnect-navbar">
//         {/* Left Nav */}
//         <Nav className="me-auto">
//           <Nav.Link as={NavLink} to="/" end>
//             Feed
//           </Nav.Link>
//           <Nav.Link as={NavLink} to="/profile/me">
//             My Profile
//           </Nav.Link>
//         </Nav>
//         {/* Search Bar */}
//         <Form className="d-flex me-3" style={{ maxWidth: 250 }}>
//           <FormControl
//             type="search"
//             placeholder="Search"
//             className="me-2"
//             aria-label="Search"
//             size="sm"
//           />
//           <Button variant="outline-light" size="sm">
//             <i className="bi bi-search"></i>
//           </Button>
//         </Form>
//         {/* Right Nav */}
//         <Nav>
//           {user ? (
//             <NavDropdown
//               title={
//                 <span>
//                   <img
//                     src={user.image || 'https://via.placeholder.com/32?text=U'}
//                     alt="avatar"
//                     className="rounded-circle me-2"
//                     width={32}
//                     height={32}
//                   />
//                   {user.username}
//                 </span>
//               }
//               id="user-dropdown"
//               align="end"
//             >
//               <NavDropdown.Item as={Link} to={`/profile/me`}>Profile</NavDropdown.Item>
//               <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
//               <NavDropdown.Divider />
//               <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
//             </NavDropdown>
//           ) : (
//             <>
//               <Nav.Link as={NavLink} to="/notifications" className="position-relative">
//                   <i className="bi bi-bell" style={{ fontSize: 20 }}></i>
//             {/* <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span> */}
//               </Nav.Link>
//               <Nav.Link as={Link} to="/login">Login</Nav.Link>
//               <Nav.Link as={Link} to="/register">Register</Nav.Link>
//             </>
//           )}
//         </Nav>
        
//       </Navbar.Collapse>
//     </Container>
//   </Navbar>
//   );
// };

// export default DevConnectNavBar;
import React from 'react';
import { 
  Navbar, 
  Nav, 
  Container, 
  Form, 
  FormControl, 
  Button, 
  Dropdown, 
  Image,
  InputGroup
} from 'react-bootstrap';
import { 
  Search, 
  BellFill, 
  ChatRightDotsFill, 
  GearFill, 
  BoxArrowRight,
  PeopleFill // Icon for DevConnect brand
} from 'react-bootstrap-icons';

// Define an interface for the user object, typical for a logged-in user
interface CurrentUser {
  name: string;
  avatarUrl: string;
}

// Mock logged-in user data (this would come from authentication context in a real app)
const currentUser: CurrentUser = {
  name: 'alasdfhice',
  avatarUrl: 'https://i.pravatar.cc/150?img=32', // Using the same avatar as previous examples for consistency
};

const DevConnectNavBar: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid className="px-4">
        {/* Brand/Logo */}
        <Navbar.Brand href="/" className="d-flex align-items-center me-4">
          <PeopleFill size={24} className="me-2 text-primary" />
          <span className="fw-bold fs-5">DevConnect</span>
        </Navbar.Brand>

        {/* Toggler for responsive design */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Main Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link href="/feed" className="mx-2">Feed</Nav.Link>
            <Nav.Link href="/profile" className="mx-2">My Profile</Nav.Link>
            {/* Add more links as needed, e.g., 'Messages', 'Notifications', 'Groups' */}
            <Nav.Link href="/messages" className="mx-2">Messages</Nav.Link>
            <Nav.Link href="/notifications" className="mx-2">Notifications</Nav.Link>
          </Nav>

          {/* Search Form */}
          <Form className="d-flex me-4 my-2 my-lg-0">
            <InputGroup>
              <FormControl
                type="search"
                placeholder="Search DevConnect..."
                className="rounded-start"
                aria-label="Search"
              />
              <Button variant="outline-light" className="rounded-end">
                <Search />
              </Button>
            </InputGroup>
          </Form>

          {/* User Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center p-0">
              <Image 
                src={currentUser.avatarUrl} 
                alt="User Avatar" 
                roundedCircle 
                style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                className="me-2 border border-secondary"
              />
              <span className="text-white me-1 d-none d-lg-block">{currentUser.name}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu variant="dark" className="shadow-lg">
              <Dropdown.Item href="/profile">
                <Image 
                  src={currentUser.avatarUrl} 
                  alt="User Avatar" 
                  roundedCircle 
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                  className="me-2"
                />
                <strong className="text-white">{currentUser.name}</strong>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="/profile/edit">
                <GearFill className="me-2" />
                Account Settings
              </Dropdown.Item>
              <Dropdown.Item href="/notifications">
                <BellFill className="me-2" />
                Notifications
              </Dropdown.Item>
              <Dropdown.Item href="/messages">
                <ChatRightDotsFill className="me-2" />
                Messages
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="/logout" className="text-danger">
                <BoxArrowRight className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DevConnectNavBar;
