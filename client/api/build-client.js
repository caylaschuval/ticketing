import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // we are in server
    // http://SERVICENAME.NAMESPACE.svc.cluster.local
    return axios.create({
      baseURL: 'https://ticketing-app-prod.makeup/',
      headers: req.headers
    })
  }
  else {
    // we are on the browser
    return axios.create({
      baseURL: '/'
    });
  }
};


export default buildClient;