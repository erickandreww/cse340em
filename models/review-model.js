const pool = require("../database/")


/* ***************************
 *  Get reviews by review_id
 * ************************** */
async function getReviewsByreviewId(review_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.review WHERE review_id = $1`,
        [review_id]
      ) 
      return data.rows[0]
    } catch (error) {
      console.error("getReviewsByInvId error " + error)
    }
}

/* ***************************
 *  Get reviews by inv_id
 * ************************** */
async function getReviewsByInvId(inv_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.review WHERE inv_id = $1`,
        [inv_id]
      ) 
      return data.rows
    } catch (error) {
      console.error("getReviewsByInvId error " + error)
    }
}

/* ***************************
 *  Get reviews by account_id
 * ************************** */
async function getReviewsByAccountId(account_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.review WHERE account_id = $1`,
        [account_id]
      ) 
      return data.rows
    } catch (error) {
      console.error("getReviewsByInvId error " + error)
    }
}

/* ***************************
 *  Register reviews function
 * ************************** */
async function registerReview(review_text, inv_id, account_id) {
    try {
      const sql = "INSERT INTO public.review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *"
      const data = await pool.query(sql, [review_text, inv_id, account_id])
        return data
      } catch (error) {
        new Error("Review Error")
      }
}

async function updateReview(review_id, review_text) {
    try {
        const sql = 
          "UPDATE public.review SET review_text = $2 WHERE review_id = $1 RETURNING *"
          const data = await pool.query(sql, [review_id, review_text])
          return data.rows[0]
        } catch (error) {
          console.error("model error: " + error)
        }
}

async function deleteReview(review_id) {
    try {
        const sql = "DELETE FROM review WHERE review_id = $1"
        const data = await pool.query(sql, [review_id])
        return data
    } catch (error) {
        console.error("model error: " + error)
    }
}

module.exports = {getReviewsByreviewId, getReviewsByInvId, getReviewsByAccountId, registerReview, updateReview, deleteReview};