const request = require("request")
const { DateTime } = require("luxon")

class Statement {
  constructor(token) {
    this.token = token
  }

  async init(acno, from, to) {
    console.log("token", this.token)

    const formattedFromDate = DateTime.fromSQL(from)
      .toFormat("dd-MMM-yyyy")
      .toUpperCase()

    const formattedToDate = DateTime.fromSQL(from)
      .toFormat("dd-MMM-yyyy")
      .toUpperCase()

    console.log(
      `Account No: ${acno}, From Date ${formattedFromDate}, To Date ${to}`
    )

    try {
      const statementData = []
      const h = await this.getHeaderData(acno, formattedFromDate)
      statementData.push(h)
      const b = await this.getBodyData(acno, formattedFromDate, formattedToDate)
      statementData.push(b)
      console.log("Data Final />>", statementData)
      return statementData
    } catch (e) {
      console.error(`Error at init: ${e}`)
      return ["Error", e]
    }
  }

  async getHeaderData(acno, fromDate) {
    const options = {
      method: "POST",
      url: "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php",
      headers: {
        Cookie: `PHPSESSID=${this.token}`,
      },

      formData: {
        column_name: `MPHONE, NVL (PMPHONE, MPHONE) PMPHONE, ACCOUNT_NAME, (SELECT P.ACC_TYPE_NAME FROM PRODUCT_SETUP P WHERE P.ACC_TYPE_CODE = R.AC_TYPE_CODE) TYPE,(SELECT ST.NAME FROM AC_STATUS ST WHERE ST.S_NAME = R.STATUS) STATUS, TO_CHAR (REG_DATE, 'MONTH dd, YYYY') REG_DATE, TO_CHAR (R.EMAIL) EMAIL, TO_CHAR (MATURITY_DATE, 'MONTH dd, YYYY') MATURITY_DATE, CUST_ID, CON_MOB, PRE_VILLAGE || ', ' || PRE_ROAD || ', ' || PRE_POST || ', ' || (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME FROM DISTHANA WHERE CODE = F.PARENT) FROM DISTHANA F WHERE CODE = E.PARENT)FROM DISTHANA E WHERE CODE = D.PARENT) FROM DISTHANA D WHERE CODE = (SELECT SUBSTR (LOCATION_CODE, 0, 6) FROM REGINFO WHERE MPHONE = R.MPHONE)) ADDR,ROUND ((FUNC_GET_ACC_BALANCE (R.MPHONE,(TO_DATE ('${fromDate}') - 1))),2) BALANCE`,
        table_name: "REGINFO R",
        condition: "AND MPHONE = " + acno,
      },
    }

    return new Promise(async (resolve, reject) => {
      try {
        request(options, function (error, response) {
          if (error) reject(`Reject by getHeaderData: ${error}`)
          resolve(response.body)
        })
      } catch (e) {
        console.log("getHeaderData Error ", e)
        reject(`Reject by getHeaderData: ${e}`)
      }
    })
  }
  async getBodyData(acno, fromDate, toDate) {
    const options = {
      method: "POST",
      url: "https://agentbanking.standardbankbd.com/agentbank_v2/includes/call_list.php",
      headers: {
        Cookie: `PHPSESSID=${this.token}`,
      },

      formData: {
        column_name: `ROW_NUMBER() OVER (ORDER BY P.TRANS_NO ASC) AS "SL",
  NVL(P.CR_AMT, 0) AS CR_AMT,
  NVL(P.DR_AMT, 0) AS DR_AMT,
  P.TRANS_NO,
  P.TRANS_DATE,
  CASE
    WHEN CODE = 'RTGSC' THEN
      NVL(
        (
          SELECT 'RTGS Received with Document ID ' || C.MSGID || ' and ' || NVL(C.INSTRFORNXTAGT, 'null') || ' as note'
          FROM AGENT_BANKING.ABS_RTGS_TRANSACTION_DST C
          WHERE C.ST_DOCNUM = P.TRANS_NO
        ),
        'RTGS Received From an Unknown Bank'
      )
    WHEN CODE = 'DS' THEN
      NVL(
        (
          SELECT 'Refund to Bank. Remarks: "' || REMARKS || '"'
          FROM AGENT_BANKING.TBL_BD_STATUS TBL
          WHERE TBL.TRANNO = P.TRANS_NO
        ),
        'Refund to Bank'
      )
    WHEN CODE = 'EFTC' THEN
      NVL(
        (
          SELECT 'Eft Received From Bank ' ||
            (
              SELECT BANK || ' ' || BRANCH
              FROM TANBIN.BANK_ROUTING
              WHERE ROUTING_NO = ORBANKRT
            ) || '(' || ORBANKRT || ')'
          FROM AGENT_BANKING.BEFTN_PROCESS_INFO_IN C
          WHERE C.TR_NO = P.TRANS_NO
        ),
        'Eft Received From an Unknown Bank'
      )
    WHEN CODE = 'CEFT' THEN
      NVL(
        (
          SELECT 'Eft Sent To Bank ' ||
            (
              SELECT BANK || ' ' || BRANCH
              FROM TANBIN.BANK_ROUTING
              WHERE ROUTING_NO = C.ROUTING_NO
            ) || '(' || ROUTING_NO || ')' || ' Account No ' || TRANS_TO || '(' || NAME_TO || ')'
          FROM AGENT_BANKING.EFT_INFO C
          WHERE C.TRANS_NO = P.TRANS_NO
        ),
        'Eft Sent To an Unknown Bank'
      )
    WHEN CODE = 'CC' THEN
      NVL(
        (
          CASE
            WHEN (
              SELECT CC.HOTKEY
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CC
              WHERE CC.TRANS_NO = P.TRANS_NO
            ) = 'INSTALLMENT' AND (
              SELECT CD.TRANS_FROM
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CD
              WHERE CD.TRANS_NO = P.TRANS_NO
            ) = P.BALANCE_MPHONE THEN (
              SELECT 'Premium for Scheme account ' || TRANS_TO
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              )
              WHERE TRANS_NO = P.TRANS_NO
            )
            WHEN (
              SELECT CC.HOTKEY
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CC
              WHERE CC.TRANS_NO = P.TRANS_NO
            ) = 'INSTALLMENT' AND (
              SELECT CD.TRANS_TO
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CD
              WHERE CD.TRANS_NO = P.TRANS_NO
            ) = P.BALANCE_MPHONE THEN (
              SELECT 'Premium Received from ' || TRANS_FROM
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              )
            )
            WHEN (
              SELECT CC.HOTKEY
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CC
              WHERE CC.TRANS_NO = P.TRANS_NO
            ) = 'MT' AND (
              SELECT CD.TRANS_FROM
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CD
              WHERE CD.TRANS_NO = P.TRANS_NO
            ) = P.BALANCE_MPHONE THEN (
              SELECT 'Fund Transfer to account ' || TRANS_TO
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              )
              WHERE TRANS_NO = P.TRANS_NO
            )
            WHEN (
              SELECT CC.HOTKEY
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CC
              WHERE CC.TRANS_NO = P.TRANS_NO
            ) = 'MT' AND (
              SELECT CD.TRANS_TO
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              ) CD
              WHERE CD.TRANS_NO = P.TRANS_NO
            ) = P.BALANCE_MPHONE THEN (
              SELECT 'Fund Received from ' || TRANS_FROM
              FROM (
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST
                UNION
                SELECT *
                FROM AGENT_BANKING.GL_TRANS_MST_OLD
              )
              WHERE TRANS_NO = P.TRANS_NO
            )
          END
        ),
        P.PARTICULAR
      )
    WHEN CODE NOT IN ('EFTC', 'CEFT', 'RTGSC', 'CC') THEN P.PARTICULAR
    WHEN CODE IS NULL THEN P.PARTICULAR
  END AS PARTICULAR`,
        table_name: `(
  SELECT *
  FROM AGENT_BANKING.GL_TRANS_DTL
  UNION
  SELECT *
  FROM AGENT_BANKING.GL_TRANS_DTL_OLD
) P`,
        condition: `BALANCE_MPHONE = TO_CHAR(${acno}) AND TRUNC (TRANS_DATE) BETWEEN TO_DATE('${fromDate}') AND TO_DATE('${toDate}') ORDER BY TRANS_NO ASC`,
      },
    }

    return new Promise(async (resolve, reject) => {
      try {
        console.log(options)
        request(options, function (error, response) {
          if (error) reject(`Reject by getHeaderData: ${error}`)
          resolve(response.body)
        })
      } catch (e) {
        console.log("getBpdyData Error ", e)
        reject(`Reject by getBodyData: ${e}`)
      }
    })
  }
}

module.exports = Statement
