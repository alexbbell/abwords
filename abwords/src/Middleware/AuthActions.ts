import { ITokens } from "../Data/interfaces"

export const LogOut = () => {
    const tokens: ITokens = {accessToken: '', refreshToken: '' }
    localStorage.setItem('tokens', JSON.stringify(tokens))

}