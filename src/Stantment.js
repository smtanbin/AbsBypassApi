class Statment {

    constructor(
        token = this.token,
        conn = new Connection(token)
    )

    async #getHeaderData(acno) {

    select = `MPHONE, NVL (PMPHONE,MPHONE) PMPHONE, ACCOUNT_NAME,(SELECT P.ACC_TYPE_NAME FROM AGENT_BANKING.PRODUCT_SETUP P WHERE P.ACC_TYPE_CODE = R.AC_TYPE_CODE) TYPE,(SELECT ST.NAME FROM AGENT_BANKING.AC_STATUS ST WHERE ST.S_NAME = R.STATUS) STATUS,TO_CHAR (REG_DATE,'MONTH dd, YYYY') REG_DATE,TO_CHAR (R.EMAIL) EMAIL,
    ROUND ((FUNC_GET_ACC_BALANCE (R.MPHONE,(TO_DATE ( :TODATE) - 1))),2) BALANCE,TO_CHAR (MATURITY_DATE,'MONTH dd, YYYY') MATURITY_DATE,CUST_ID,CON_MOB,PRE_VILLAGE|| ', '|| PRE_ROAD|| ', '|| PRE_POST|| ', '|| (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME FROM AGENT_BANKING.DISTHANA WHERE CODE = F.PARENT) FROM AGENT_BANKING.DISTHANA F WHERE CODE = E.PARENT) FROM
    AGENT_BANKING.DISTHANA E WHERE CODE = D.PARENT) FROM AGENT_BANKING.DISTHANA D WHERE CODE = (SELECT SUBSTR (LOCATION_CODE,0,6) FROM AGENT_BANKING.REGINFO WHERE MPHONE = R.MPHONE)) ADDR`
    from= `AGENT_BANKING.REGINFO R`
        where= `MPHONE = ${acno}`
        new Promise((resolve, reject) => {
            try {
                const data = conn.get(select, from, where)
                resolve(data)
            } catch (e) {
                reject(e)
            }
})
  }

    #getBodyData(acno,from,to) {
          select =`SELECT ROW_NUMBER() OVER (ORDER BY P.TRANS_NO ASC)                                                  AS "SL",
    NVL (P.CR_AMT,
    0)                                                               CR_AMT,
    NVL (P.DR_AMT,
    0)                                                               DR_AMT,
    P.TRANS_NO,
    P.TRANS_DATE,
    (CASE
        WHEN CODE = 'RTGSC' THEN
            NVL ((
                SELECT
                    'RTGS Recived with Document ID '|| C.MSGID || ' and ' || NVL (C.INSTRFORNXTAGT,
                    'null') || 'as note'
                FROM
                    AGENT_BANKING.ABS_RTGS_TRANSACTION_DST C
                WHERE
                    C.ST_DOCNUM = P.TRANS_NO
            ), 'RTGS Recived From a Unknown Bank')
        WHEN CODE = 'DS' THEN
            NVL ((
                SELECT
                    'Refund to Bank. Remarks: "' || REMARKS || '"'
                FROM
                    AGENT_BANKING.TBL_BD_STATUS TBL
                WHERE
                    TBL.TRANNO = P.TRANS_NO
            ), 'Refund to Bank')
        WHEN CODE = 'EFTC' THEN
            NVL ((
                SELECT
                    'Eft Recived From Bank ' || (
                    SELECT
                        BANK || ' ' || BRANCH
                    FROM
                        TANBIN.BANK_ROUTING
                    WHERE
                        ROUTING_NO = ORBANKRT)
                            || '('
                            || ORBANKRT
                            || ')'
                    FROM
                        AGENT_BANKING.BEFTN_PROCESS_INFO_IN C
                    WHERE
                        C.TR_NO = P.TRANS_NO
            ), 'Eft Recived From a Unknown Bank')
        WHEN CODE = 'CEFT' THEN
            NVL ((
                SELECT
                    'Eft Send To Bank ' || (
                    SELECT
                        BANK || ' ' || BRANCH
                    FROM
                        TANBIN.BANK_ROUTING
                    WHERE
                        ROUTING_NO = C.ROUTING_NO)
                            || '('
                            || ROUTING_NO
                            || ')'
                            || ' Account No '
                            || TRANS_TO
                            || '('
                            || NAME_TO
                            || ')'
                    FROM
                        AGENT_BANKING.EFT_INFO C
                    WHERE
                        C.TRANS_NO = P.TRANS_NO
            ), 'Eft Send To A Unknown Bank')
        WHEN CODE = 'CC' THEN
            NVL ( (
                CASE
                    WHEN (
                        SELECT
                            CC.HOTKEY
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CC
                        WHERE
                            CC.TRANS_NO = P.TRANS_NO
                    ) = 'INSTALLMENT' AND (
                        SELECT
                            CD.TRANS_FROM
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CD
                        WHERE
                            CD.TRANS_NO = P.TRANS_NO
                    ) = P.BALANCE_MPHONE THEN
                        (
                            SELECT
                                'Premium for Scheam account ' || TRANS_TO
                            FROM
                                (
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST UNION
                                        SELECT
                                            *
                                        FROM
                                            AGENT_BANKING.GL_TRANS_MST_OLD
                                )
                            WHERE
                                TRANS_NO = P.TRANS_NO
                        )
                    WHEN (
                        SELECT
                            CC.HOTKEY
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CC
                        WHERE
                            CC.TRANS_NO = P.TRANS_NO
                    ) = 'INSTALLMENT' AND (
                        SELECT
                            CD.TRANS_TO
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CD
                        WHERE
                            CD.TRANS_NO = P.TRANS_NO
                    ) = P.BALANCE_MPHONE THEN
                        (
                            SELECT
                                'Premium Recived from ' || TRANS_FROM
                            FROM
                                (
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST UNION
                                        SELECT
                                            *
                                        FROM
                                            AGENT_BANKING.GL_TRANS_MST_OLD
                                )
                        )
                    WHEN (
                        SELECT
                            CC.HOTKEY
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CC
                        WHERE
                            CC.TRANS_NO = P.TRANS_NO
                    ) = 'MT' AND (
                        SELECT
                            CD.TRANS_FROM
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CD
                        WHERE
                            CD.TRANS_NO = P.TRANS_NO
                    ) = P.BALANCE_MPHONE THEN
                        (
                            SELECT
                                'Fund Transfer to account ' || TRANS_TO
                            FROM
                                (
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST UNION
                                        SELECT
                                            *
                                        FROM
                                            AGENT_BANKING.GL_TRANS_MST_OLD
                                )
                            WHERE
                                TRANS_NO = P.TRANS_NO
                        )
                    WHEN (
                        SELECT
                            CC.HOTKEY
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CC
                        WHERE
                            CC.TRANS_NO = P.TRANS_NO
                    ) = 'MT' AND (
                        SELECT
                            CD.TRANS_TO
                        FROM
                            (
                                SELECT
                                    *
                                FROM
                                    AGENT_BANKING.GL_TRANS_MST UNION
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST_OLD
                            ) CD
                        WHERE
                            CD.TRANS_NO = P.TRANS_NO
                    ) = P.BALANCE_MPHONE THEN
                        (
                            SELECT
                                'Fund Recived from ' || TRANS_FROM
                            FROM
                                (
                                    SELECT
                                        *
                                    FROM
                                        AGENT_BANKING.GL_TRANS_MST UNION
                                        SELECT
                                            *
                                        FROM
                                            AGENT_BANKING.GL_TRANS_MST_OLD
                                )
                            WHERE
                                TRANS_NO = P.TRANS_NO
                        )
                END), P.PARTICULAR) WHEN CODE NOT IN ('EFTC',
    'CEFT',
    'RTGSC',
    'CC') THEN P.PARTICULAR WHEN CODE IS NULL THEN P.PARTICULAR END) PARTICULAR`
        from=`(
        SELECT
            *
        FROM
            AGENT_BANKING.GL_TRANS_DTL UNION
            SELECT
                *
            FROM
                AGENT_BANKING.GL_TRANS_DTL_OLD
    ) P`
        where= `BALANCE_MPHONE = TO_CHAR(${acno})
    AND TRUNC (TRANS_DATE) BETWEEN TO_DATE(${from})
    AND TO_DATE(${to})
ORDER BY
    TRANS_NO ASC`
        new Promise((resolve, reject) => {
            try {
                const data = conn.get(select, from, where)
                resolve(data)
            } catch (e) {
                reject(e)
            }
})
  }

    async get(acno, from, to) {
        const ststmentData = []
        const h = await this.#getHeaderData(acno)
        ststmentData.push(h)
        const b = await this.#getBodyData(acno, from, to)
        ststmentData.push(b)
        return ststmentData
  }
 
}

module.exports = Statment