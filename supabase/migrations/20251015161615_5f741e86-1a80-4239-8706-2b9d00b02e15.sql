-- Créer le trigger pour mettre à jour updated_at sur comforters
CREATE TRIGGER update_comforters_updated_at
BEFORE UPDATE ON public.comforters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();