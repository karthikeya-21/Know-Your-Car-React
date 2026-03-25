import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadProfilePhoto } from '../firebase/services';
import './EditProfile.css';

export default function EditProfile() {
  const { user, profile, updateProfile } = useAuth();
  const navigate                         = useNavigate();
  const profileData                      = profile?.data || {};

  const [name,    setName]    = useState(profileData.name  || '');
  const [bio,     setBio]     = useState(profileData.bio   || '');
  const [phone,   setPhone]   = useState(profileData.phone || '');
  const [preview, setPreview] = useState(profileData.image || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let imageUrl = profileData.image || '';

      // Upload to Firebase Storage if new photo selected
      // Mirrors Flutter's profile_pic.dart upload flow
      if (photoFile) {
        imageUrl = await uploadProfilePhoto(photoFile, user.uid);
      }

      const updates = { name, bio, phone, image: imageUrl };

      // Update in Realtime Database — mirrors Flutter's dbref.child(dbkey).update()
      await updateUserProfile(profile.dbKey, updates);
      updateProfile(updates);

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ep-page">
      <div className="ep-card">
        <div className="ep-card__header">
          <h1 className="ep-card__title">Edit Profile</h1>
          <p className="ep-card__sub">Update your name, bio, phone and photo</p>
        </div>

        {error   && <div className="ep-error">{error}</div>}
        {success && <div className="ep-success">{success}</div>}

        <form className="ep-form" onSubmit={handleSubmit}>

          {/* ── Photo ── */}
          <div className="ep-photo-section">
            <div
              className="ep-avatar"
              onClick={() => fileInputRef.current?.click()}
              role="button" tabIndex={0}
              aria-label="Change profile photo"
            >
              {preview
                ? <img src={preview} alt="Preview" />
                : <span>{(user?.email || 'U')[0].toUpperCase()}</span>
              }
              <div className="ep-avatar__overlay"><span>📷</span></div>
            </div>
            <div className="ep-photo-info">
              <p className="ep-photo-label">Profile Photo</p>
              <p className="ep-photo-hint">Uploaded to Firebase Storage. JPG, PNG up to 10MB.</p>
              <button type="button" className="ep-photo-btn" onClick={() => fileInputRef.current?.click()}>
                Choose Photo
              </button>
            </div>
            <input
              ref={fileInputRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handlePhotoChange}
            />
          </div>

          <div className="ep-divider" />

          {/* ── Fields — mirrors Flutter's my_account.dart ── */}
          <div className="ep-field">
            <label htmlFor="name">Username / Name</label>
            <input
              id="name" type="text" placeholder="Your name"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="ep-field">
            <label htmlFor="bio">Bio</label>
            <input
              id="bio" type="text" placeholder="A short bio"
              value={bio} onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="ep-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone" type="tel" placeholder="Your phone number"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="ep-field">
            <label htmlFor="email">
              Email <span className="ep-readonly-badge">Read only</span>
            </label>
            <input id="email" type="email" value={user?.email || ''} readOnly disabled />
          </div>

          <div className="ep-actions">
            <button type="submit" className="ep-btn ep-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button" className="ep-btn ep-btn--secondary"
              onClick={() => navigate('/profile')} disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
