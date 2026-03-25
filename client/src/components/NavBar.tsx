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
  InputGroup,
} from 'react-bootstrap';
import {
  Search,
  BellFill,
  ChatRightDotsFill,
  GearFill,
  BoxArrowRight,
  PeopleFill,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../avatarPlaceholder';
import { useAuth } from '../contexts/AuthContext';

const DevConnectNavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const displayName = user?.username ?? '';
  const avatarUrl = getAvatarUrl(user?.image);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-4">
          <PeopleFill size={24} className="me-2 text-primary" />
          <span className="fw-bold fs-5">DevConnect</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-2">
              Feed
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" className="mx-2">
              My Profile
            </Nav.Link>
            <Nav.Link href="/messages" className="mx-2">
              Messages
            </Nav.Link>
            <Nav.Link href="/notifications" className="mx-2">
              Notifications
            </Nav.Link>
          </Nav>

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

          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center p-0">
                <Image
                  src={avatarUrl}
                  alt=""
                  roundedCircle
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  className="me-2 border border-secondary"
                />
                <span className="text-white me-1 d-none d-lg-block">{displayName}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu variant="dark" className="shadow-lg">
                <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                  <Image
                    src={avatarUrl}
                    alt=""
                    roundedCircle
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    className="me-2"
                  />
                  <strong className="text-white">{displayName}</strong>
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
                <Dropdown.Item
                  onClick={() => {
                    logout();
                  }}
                  className="text-danger"
                >
                  <BoxArrowRight className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login" className="text-white">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="text-white">
                Register
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DevConnectNavBar;
