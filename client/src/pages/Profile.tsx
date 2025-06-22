// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { Card, Badge, Spinner, Alert, Image } from 'react-bootstrap';
// import { useAuth } from '../contexts/AuthContext';
// type UserProfile = {
//   username: string;
//   email: string;
//   bio?: string;
//   image?: string;
//   skills?: string[];
// };

// const Profile = () => {
//   const { id } = useParams();
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const { token } = useAuth();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         // If 'me', fetch current user profile, else fetch by id
//         const endpoint = id === 'me'
//           ? 'http://localhost:3000/api/users/profile'
//           : `http://localhost:3000/api/users/${id}`;
//         const res = await fetch(endpoint, {
//           headers: {
//             // Add Authorization header if using JWT for /profile
//             'Authorization': `Bearer ${token}`,      }
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
//         setProfile(data);
//       } catch (err: any) {
//         setError(err.message || 'Network error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [id]);

//   if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
//   if (error) return <Alert variant="danger">{error}</Alert>;
//   if (!profile) return null;

//   return (
//     <Card className="mx-auto" style={{ maxWidth: 500, marginTop: 40 }}>
//       <Card.Body>
//         <div className="d-flex align-items-center mb-3">
//           <Image
//             src={profile.image || 'https://via.placeholder.com/80?text=User'}
//             roundedCircle
//             width={80}
//             height={80}
//             className="me-3"
//             alt="User Avatar"
//           />
//           <div>
//             <Card.Title className="mb-0">{profile.username}</Card.Title>
//             <Card.Subtitle className="text-muted">{profile.email}</Card.Subtitle>
//           </div>
//         </div>
//         <Card.Text>
//           <strong>Bio:</strong> {profile.bio || <span className="text-muted">No bio yet.</span>}
//         </Card.Text>
//         <div>
//           <strong>Skills:</strong>
//           {profile.skills && profile.skills.length > 0 ? (
//             profile.skills.map((skill, idx) => (
//               <Badge bg="info" key={idx} className="me-2">{skill}</Badge>
//             ))
//           ) : (
//             <span className="text-muted ms-2">No skills listed.</span>
//           )}
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default Profile;

import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Image,
  ListGroup,
  ProgressBar,
  Row
} from 'react-bootstrap';
import {
  Github,
  Globe,
  Linkedin,
  Twitter
} from 'react-bootstrap-icons';

// Define TypeScript interfaces for type safety
interface Skill {
  name: string;
  level: number; // Proficiency level from 0 to 100
}

interface UserProfile {
  name: string;
  avatarUrl: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  socials: {
    github: string;
    twitter: string;
    linkedin: string;
  };
  skills: Skill[];
  projects: {
      name: string;
      status: number;
  }[];
}

// Mock data for the profile page, inspired by your 'DevConnect' project and skills [2][7]
const userProfileData: UserProfile = {
  name: 'Alex Doe',
  avatarUrl: 'https://i.pravatar.cc/150?img=32', // Placeholder avatar
  title: 'Full-Stack Developer',
  location: 'San Francisco, CA',
  email: 'alex.doe@example.com',
  phone: '(123) 456-7890',
  bio: 'Passionate full-stack developer with expertise in React, Node.js, and cloud technologies. Currently building DevConnect, a social platform for developers.',
  website: 'https://alexdoe.dev',
  socials: {
    github: 'alex-doe',
    twitter: '@alexdoe',
    linkedin: 'in/alex-doe',
  },
  skills: [
    { name: 'React & TypeScript', level: 95 },
    { name: 'Node.js & Express', level: 90 },
    { name: 'User Authentication (JWT)', level: 88 },
    { name: 'Bootstrap & CSS', level: 85 },
    { name: 'XGBoost/LightGBM', level: 75 },
    { name: 'Testing & QA', level: 80 },
  ],
  projects: [
      { name: 'DevConnect Platform', status: 70 },
      { name: 'E-commerce API', status: 90 },
      { name: 'ML Price Predictor', status: 65 },
  ]
};


const ProfilePage = () => {
  const user = userProfileData;

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        {/* Breadcrumb Navigation */}
        <Row>
          <Col>
            <Breadcrumb className="bg-white rounded-3 p-3 mb-4">
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/users">Users</Breadcrumb.Item>
              <Breadcrumb.Item active>User Profile</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>

        <Row>
          {/* Left Column: Profile Picture & Socials */}
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Body className="text-center">
                <Image
                  src={user.avatarUrl}
                  alt="User Avatar"
                  roundedCircle
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  className="mb-3"
                />
                <h5 className="mb-1">{user.name}</h5>
                <p className="text-muted mb-2">{user.title}</p>
                <p className="text-muted mb-4">{user.location}</p>
                <div className="d-flex justify-content-center mb-2">
                  <Button variant="primary">Follow</Button>
                  <Button variant="outline-primary" className="ms-1">Message</Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body className="p-0">
                <ListGroup variant="flush" className="rounded-3">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center p-3">
                    <Globe size={20} className="text-warning" />
                    <Card.Text>{user.website}</Card.Text>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center p-3">
                    <Github size={20} style={{ color: '#333' }} />
                    <Card.Text>{user.socials.github}</Card.Text>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center p-3">
                    <Twitter size={20} style={{ color: '#55acee' }} />
                    <Card.Text>{user.socials.twitter}</Card.Text>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center p-3">
                    <Linkedin size={20} style={{ color: '#0077b5' }} />
                    <Card.Text>{user.socials.linkedin}</Card.Text>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: User Details, Bio & Skills */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col sm={3}><Card.Text>Full Name</Card.Text></Col>
                  <Col sm={9}><Card.Text className="text-muted">{user.name}</Card.Text></Col>
                </Row>
                <hr />
                <Row>
                  <Col sm={3}><Card.Text>Email</Card.Text></Col>
                  <Col sm={9}><Card.Text className="text-muted">{user.email}</Card.Text></Col>
                </Row>
                <hr />
                <Row>
                  <Col sm={3}><Card.Text>Phone</Card.Text></Col>
                  <Col sm={9}><Card.Text className="text-muted">{user.phone}</Card.Text></Col>
                </Row>
                <hr />
                <Row>
                  <Col sm={3}><Card.Text>Location</Card.Text></Col>
                  <Col sm={9}><Card.Text className="text-muted">{user.location}</Card.Text></Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>About Me</Card.Title>
                    <Card.Text>{user.bio}</Card.Text>
                </Card.Body>
            </Card>

            <Row>
              <Col md={6}>
                <Card className="mb-4 mb-md-0">
                  <Card.Body>
                    <Card.Text className="mb-4">
                      <span className="text-primary fw-bold me-1">Skills</span>
                    </Card.Text>
                    {user.skills.map((skill, index) => (
                      <div key={index} className={index > 0 ? 'mt-3' : ''}>
                        <Card.Text>{skill.name}</Card.Text>
                        <ProgressBar now={skill.level} label={`${skill.level}%`} />
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                 <Card className="mb-4 mb-md-0">
                  <Card.Body>
                    <Card.Text className="mb-4">
                      <span className="text-primary fw-bold me-1">Project Status</span>
                    </Card.Text>
                    {user.projects.map((project, index) => (
                      <div key={index} className={index > 0 ? 'mt-3' : ''}>
                        <Card.Text>{project.name}</Card.Text>
                        <ProgressBar variant="success" now={project.status} label={`${project.status}%`} />
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
