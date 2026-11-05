import handler from '../netlify/functions/api.mjs';
// Share the same verified request handler on Vercel and Netlify.
export default {fetch(request){return handler(request)}};
