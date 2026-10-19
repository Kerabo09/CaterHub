import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import type { Role } from '../../types';

/** Only lets the matching kind of account through; everyone else is sent to the right login page. */
