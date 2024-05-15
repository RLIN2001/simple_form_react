import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BaseResponse } from "../interfaces";

type Inputs = {
	name: string;
	age: number;
	married?: boolean;
	birthdate: string;
};

export default function CheckUserData() {
	const [status, setStatus] = useState<
		| "INITIAL"
		| "SEND_DATA"
		| "SENDING_DATA"
		| "DATA_SENDED"
		| "ERROR_SENDING_DATA"
	>();
	const [data, setData] = useState<BaseResponse>();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors },
	} = useForm<Inputs>();

	const onSubmit: SubmitHandler<Inputs> = (data) => {
		setStatus("SEND_DATA");

		data.age = Number(data.age);
		fetch("http://localhost:3001/info/validate-user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((rawResponse) => {
				if ([200, 201].includes(rawResponse.status)) {
					return rawResponse.json();
				} else {
					throw new Error();
				}
			})
			.then((response: BaseResponse) => {
				setStatus("DATA_SENDED");
				setData(response);
				reset();
			})
			.catch((e) => {
				setStatus("ERROR_SENDING_DATA");
			});
	};

	const calculateAge = (birthdate: string) => {
		const today = new Date();
		const birthDate = new Date(birthdate);
		let age = today.getFullYear() - birthDate.getFullYear();

		const monthDifference = today.getMonth() - birthDate.getMonth();
		if (
			monthDifference < 0 ||
			(monthDifference === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	if (status === "ERROR_SENDING_DATA") {
		return (
			<div>
				<h1>ERRORE INVIO DATI</h1>
				<button onClick={() => setStatus("INITIAL")}>RIPROVA</button>
			</div>
		);
	}

	if (status === "SEND_DATA" || status === "SENDING_DATA") {
		return (
			<div>
				<h1>INVIO IN CORSO</h1>
				<button onClick={() => setStatus("INITIAL")}>ANNULLA</button>
			</div>
		);
	}

	if (status === "DATA_SENDED") {
		return (
			<div>
				{data?.success === true && <h1>DATI INVIATI VALIDI</h1>}
				{data?.success === false && (
					<>
						<h1>DATI INVIATI NON VALIDI</h1>
						{data.errors.map((error, index) => (
							<>
								{error.constraints &&
									Object.values(error.constraints).map((message, i) => (
										<p key={i}>{message}</p>
									))}
							</>
						))}
					</>
				)}
				<button onClick={() => setStatus("INITIAL")}>
					INVIA UN ALTRO VALORE
				</button>
			</div>
		);
	}
	return (
		<>
			<h1>INSERISCI I DATI DELL'UTENTE</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					placeholder="enter a name"
					{...register("name", { required: true, minLength: 5, maxLength: 50 })}
				/>
				<br />
				{errors.name && (
					<>
						<span>
							{errors.name.type === "required" && "This field is required"}
							{errors.name.type === "minLength" &&
								"Name must be at least 5 characters"}
							{errors.name.type === "maxLength" &&
								"Name must be at most 50 characters"}
						</span>
						<br />
					</>
				)}
				<input
					type="number"
					placeholder="enter an age"
					inputMode="numeric"
					{...register("age", { required: true, min: 1, max: 150 })}
					onChange={(e) => {
						const ageValue = parseInt(e.target.value);
						setValue("age", ageValue);
					}}
				/>
				<br />
				{errors.age && (
					<>
						<span>
							{errors.age.type === "required" && "This field is required"}
							{errors.age.type === "min" && "Age must be at least 1"}
							{errors.age.type === "max" && "Age must be at most 150"}
						</span>
						<br />
					</>
				)}

				{watch("age") >= 18 && (
					<>
						<label>
							Married:
							<input
								type="checkbox"
								disabled={watch("age") < 18}
								{...register("married")}
							/>
						</label>
						<br />
					</>
				)}

				<label>
					Date of Birth:
					<input
						type="date"
						placeholder="enter birthdate"
						{...register("birthdate", {
							required: true,
							validate: (value) => {
								if (!value) return true;
								const ageCalculated = calculateAge(value);
								if (ageCalculated === +watch("age")) return true;
								else return "Birthdate does not match the age";
							},
						})}
					/>
				</label>
				<br />
				{errors.birthdate && (
					<>
						<span>
							{errors.birthdate.type === "required" && "This field is required"}
							{errors.birthdate.type === "validate" && errors.birthdate.message}
						</span>
						<br />
					</>
				)}

				<button type="submit">Valida</button>
			</form>
		</>
	);
}
