import { useParams } from 'react-router-dom';
import PartyInvites from '../components/PartyInvites';

function ViewThread() {
    const { threadId } = useParams();
    return (
        <div style={{ maxWidth: 600, margin: '32px auto', padding: '0 16px' }}>
            <PartyInvites threadId={threadId} />
        </div>
    );
}

export default ViewThread;

// PARA TESTAR até fazeres essa parte :) depois podes apagar