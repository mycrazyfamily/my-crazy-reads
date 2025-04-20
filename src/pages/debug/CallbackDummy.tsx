
import Callback from '../auth/Callback';

const CallbackDummy = () => {
  console.log('🧪 CallbackDummy.tsx: rendu déclenché');
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🧪 Test de la Callback</h2>
      <p>Ce composant monte le composant réel de /auth/callback</p>
      <Callback />
    </div>
  );
};

export default CallbackDummy;
