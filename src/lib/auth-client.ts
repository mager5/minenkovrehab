export async function authPost(path: string, body: unknown = {}) {
  const challenge=await fetch('/api/auth/csrf',{credentials:'same-origin',cache:'no-store'});
  const csrf=await challenge.json();
  if(!challenge.ok||!csrf?.data?.csrfToken)throw new Error('Сервис авторизации недоступен.');
  return fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','x-csrf-token':csrf.data.csrfToken},body:JSON.stringify(body)});
}
