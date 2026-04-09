import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar  from './AdminTopBar';

import UsersSection       from '../sections/UsersSection';
import DatabaseSection    from '../sections/DatabaseSection';
import ContentSection     from '../sections/ContentSection';
import PricingSection     from '../sections/PricingSection';
import FeatureFlagsSection from '../sections/FeatureFlagsSection';
import LogsSection        from '../sections/LogsSection';
import SettingsSection    from '../sections/SettingsSection';

const SECTIONS = {
  users:    UsersSection,
  database: DatabaseSection,
  content:  ContentSection,
  pricing:  PricingSection,
  flags:    FeatureFlagsSection,
  logs:     LogsSection,
  settings: SettingsSection,
};

export default function AdminLayout() {
  const { section = 'users' } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch]       = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const ActiveSection = SECTIONS[section] ?? SECTIONS.users;

  function handleNavigate(key) {
    setSearch('');
    navigate(`/admin/${key}`);
  }

  return (
    <div className="adm-shell">
      <AdminSidebar
        active={section}
        onNavigate={handleNavigate}
        collapsed={collapsed}
      />

      <div className="adm-main">
        <AdminTopBar
          active={section}
          onToggleSidebar={() => setCollapsed(c => !c)}
          search={search}
          onSearch={setSearch}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />

        <div className="adm-content">
          <ActiveSection key={`${section}-${refreshKey}`} search={search} />
        </div>
      </div>
    </div>
  );
}
