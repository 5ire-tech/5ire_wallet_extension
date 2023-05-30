import { Spin } from 'antd'
import { useSelector } from 'react-redux'

export default function Loader() {
  const isLoading = useSelector((state) => state?.auth?.isLoading)

  if (isLoading) {
    return (
      <div className='loader'>
        <Spin size='large' />
      </div>
    )
  } else {
    return []
  }
}
