import { mainUrl } from './dbConnection';

type GetDataResponse<T> = { data: T | null; errors: string | null };

const makeParamsString = (params?: any) => {
  if (params == null) return null;

  const paramsString = Object.keys(params).reduce((acc, e) => {
    const seperator = acc === '' ? '' : '&';
    return acc + seperator + `${e}=${params[e]}`;
  }, '');
  return paramsString;
};

export default async function getData<T>(
  fakeData: any,
  route: string,
  params?: any
): Promise<GetDataResponse<T>> {
  let url = mainUrl + `/${route}`;

  const paramsString = makeParamsString(params);
  if (paramsString) {
    url += `?${paramsString}`;
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-formula-1.p.rapidapi.com',
        'x-rapidapi-key': '0f2fb9a6e43206a0f37c4b67ad022417', // should usually be in .env
      },
    });
    const data = await res.json();

    if (!!data.errors && data.errors.length !== 0) {
      return { data: null, errors: data.errors };
    }
    if (!data || !data.response) {
      return { data: null, errors: 'no data returned' };
    }

    return { data: data.response, errors: null };
  } catch (e) {
    return { data: null, errors: e as string };
  }
}
