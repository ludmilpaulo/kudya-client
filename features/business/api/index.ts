import v1Client from '../../../shared/api/v1Client';

export type Business = {
  id: number;
  name: string;
  slug: string;
  category_slug: string;
  dashboard_route: string;
  status: string;
  is_active: boolean;
};

export async function fetchMyBusinesses(): Promise<Business[]> {
  const { data } = await v1Client.get<Business[]>('/businesses/me/');
  return data;
}
