import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Image,
  ProgressBar,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../config';
import { useAuth } from '../contexts/AuthContext';

type ApiUserProfile = {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  bio?: string;
  image?: string | null;
  skills?: unknown[];
  followers?: string[];
  following?: string[];
};

function normalizeSkill(raw: unknown, index: number): { name: string; level: number } {
  if (typeof raw === 'string') {
    return { name: raw, level: 70 };
  }
  if (raw && typeof raw === 'object' && 'name' in raw) {
    const o = raw as { name?: unknown; level?: unknown };
    const level = typeof o.level === 'number' ? o.level : 70;
    return { name: String(o.name ?? `Skill ${index + 1}`), level: Math.min(100, Math.max(0, level)) };
  }
  return { name: String(raw), level: 70 };
}

const placeholderAvatar = 'https://via.placeholder.com/150?text=User';

const ProfilePage = () => {
  const { id: routeId } = useParams();
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const viewMyProfile = useMemo(
    () => !routeId || routeId === 'me',
    [routeId],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError('');
      setProfile(null);

      if (viewMyProfile && !token) {
        setError('Log in to view your profile.');
        setLoading(false);
        return;
      }

      try {
        const url = viewMyProfile
          ? apiUrl('/api/users/profile')
          : apiUrl(`/api/users/${routeId}`);

        const headers: HeadersInit = {};
        if (viewMyProfile && token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        const data = (await res.json()) as ApiUserProfile & { message?: string };

        if (cancelled) return;

        if (!res.ok) {
          setError(data.message || 'Failed to load profile');
          return;
        }

        setProfile(data);
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [routeId, token, viewMyProfile]);

  const displayName = profile?.username ?? '';
  const avatarUrl = profile?.image || placeholderAvatar;
  const skills = (profile?.skills ?? []).map(normalizeSkill);
  const followerCount = profile?.followers?.length ?? 0;
  const followingCount = profile?.following?.length ?? 0;
  const isOwnProfile =
    viewMyProfile ||
    (authUser?.id && profile && (profile.id === authUser.id || profile._id === authUser.id));

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}{' '}
        {viewMyProfile && (
          <Link to="/login">Go to login</Link>
        )}
      </Alert>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        <Row>
          <Col>
            <Breadcrumb className="bg-white rounded-3 p-3 mb-4">
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Profile</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>

        <Row>
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Body className="text-center">
                <Image
                  src={avatarUrl}
                  alt=""
                  roundedCircle
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  className="mb-3"
                />
                <h5 className="mb-1">{displayName}</h5>
                <p className="text-muted mb-2 small">{profile.email}</p>
                <p className="text-muted mb-3 small">
                  {followerCount} followers · {followingCount} following
                </p>
                {!isOwnProfile && (
                  <div className="d-flex justify-content-center mb-2">
                    <Button variant="primary" disabled>
                      Follow
                    </Button>
                    <Button variant="outline-primary" className="ms-1" disabled>
                      Message
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col sm={3}>
                    <Card.Text>Username</Card.Text>
                  </Col>
                  <Col sm={9}>
                    <Card.Text className="text-muted">{profile.username}</Card.Text>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col sm={3}>
                    <Card.Text>Email</Card.Text>
                  </Col>
                  <Col sm={9}>
                    <Card.Text className="text-muted">{profile.email}</Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <Card.Title>About</Card.Title>
                <Card.Text>
                  {profile.bio?.trim()
                    ? profile.bio
                    : <span className="text-muted">No bio yet.</span>}
                </Card.Text>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <Card.Text className="mb-4">
                  <span className="text-primary fw-bold me-1">Skills</span>
                </Card.Text>
                {skills.length === 0 ? (
                  <span className="text-muted">No skills listed.</span>
                ) : (
                  skills.map((skill, index) => (
                    <div key={`${skill.name}-${index}`} className={index > 0 ? 'mt-3' : ''}>
                      <Card.Text>{skill.name}</Card.Text>
                      <ProgressBar now={skill.level} label={`${skill.level}%`} />
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;
