import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
	name: string;
	age: number;
	married?: boolean;
	birthdate?: string;
};

export default function CheckUserData() {
	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = (data) => {
		reset();
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
					{...register("age", { required: true, min: 1, max: 150 })}
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
