


export interface IConstant {
    mainApiUrl: string,
}
const siteObjectsDev:IConstant = {
    mainApiUrl: import.meta.env.VITE_REACT_API_URL
    //mainApiUrl: "/demodata/"
}

const siteObjectsProd:IConstant = {
    mainApiUrl: import.meta.env.VITE_REACT_API_URL
}
console.log('t', import.meta.env )
export const SiteVars: IConstant = (import.meta.env.VITE_APP_ENV === "dev") ? siteObjectsDev : siteObjectsProd
console.log('SiteVars', SiteVars )


export const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    border: '1px solid #CCC',
    borderRadius: '5px',
    boxShadow: 24,
    p: 4,
  };
