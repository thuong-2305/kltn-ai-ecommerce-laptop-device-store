function HomeErrorState({ message }) {
  return (
    <div className="status-card status-card--error">
      <p>{message}</p>
    </div>
  )
}

export default HomeErrorState